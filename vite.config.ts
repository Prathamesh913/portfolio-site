import {
  defineConfig,
  loadEnv,
  type Connect,
  type Plugin,
  type ViteDevServer,
} from "vite";
import react from "@vitejs/plugin-react";

// Local mirror of the Vercel-style handlers in `api/`.
//
// On Vercel these files run as serverless functions. Under plain `vite` /
// `vite preview` they are not served at all — Vite transforms and returns the
// raw `.ts` module for `/api/trakt/recent` (Content-Type: text/javascript), so
// the client's `res.json()` throws and the Trakt shelf silently renders
// nothing. This plugin mounts the SAME handlers as middleware for localhost.
// Production behaviour is untouched; no second Trakt integration is added.
const API_ROUTES: Record<string, string> = {
  "/api/currently": "api/currently.ts",
  "/api/github": "api/github.ts",
  "/api/spotify/token": "api/spotify/token.ts",
  "/api/trakt/recent": "api/trakt/recent.ts",
  "/api/trakt/image": "api/trakt/image.ts",
};

type ApiHandler = (req: unknown, res: unknown) => unknown;

function parseRequest(rawUrl: string): {
  pathname: string;
  query: Record<string, string>;
} {
  const queryStart = rawUrl.indexOf("?");
  const pathname = queryStart === -1 ? rawUrl : rawUrl.slice(0, queryStart);
  const query: Record<string, string> = {};
  if (queryStart !== -1) {
    for (const pair of rawUrl.slice(queryStart + 1).split("&")) {
      if (!pair) continue;
      const eq = pair.indexOf("=");
      const key = decodeURIComponent(eq === -1 ? pair : pair.slice(0, eq));
      query[key] = decodeURIComponent(eq === -1 ? "" : pair.slice(eq + 1));
    }
  }
  return { pathname, query };
}

function localApi(): Plugin {
  const node = globalThis as unknown as {
    process: { cwd(): string; env: Record<string, string | undefined> };
  };
  let root = node.process.cwd();
  const handlers = new Map<string, ApiHandler>();

  const load = async (
    relative: string,
    server?: ViteDevServer
  ): Promise<ApiHandler | null> => {
    const cached = handlers.get(relative);
    if (cached) return cached;
    try {
      // Dev uses Vite's module runner (handles TS + any imports); preview has
      // no module runner, so load the file URL directly.
      const mod = server
        ? ((await server.ssrLoadModule(`/${relative}`)) as { default?: unknown })
        : ((await import(
            /* @vite-ignore */ encodeURI(`file://${root}/${relative}`)
          )) as { default?: unknown });
      if (typeof mod.default !== "function") return null;
      const handler = mod.default as ApiHandler;
      handlers.set(relative, handler);
      return handler;
    } catch {
      return null;
    }
  };

  const middleware = (server?: ViteDevServer): Connect.NextHandleFunction => {
    return async (rawReq, rawRes, next) => {
      const req = rawReq as unknown as { url?: string; method?: string; headers: unknown };
      const res = rawRes as unknown as {
        statusCode: number;
        headersSent: boolean;
        setHeader(key: string, value: string): void;
        end(body?: unknown): void;
      };
      const { pathname, query } = parseRequest(req.url || "/");
      const relative = API_ROUTES[pathname];
      if (!relative) return next();
      const handler = await load(relative, server);
      if (!handler) return next();
      const apiRes = {
        setHeader: (key: string, value: string) => {
          res.setHeader(key, value);
          return apiRes;
        },
        status: (code: number) => {
          res.statusCode = code;
          return apiRes;
        },
        json: (body: unknown) => {
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(body));
          return apiRes;
        },
        send: (body: unknown) => {
          res.end(body);
          return apiRes;
        },
        end: (body?: unknown) => {
          res.end(body);
          return apiRes;
        },
      };
      try {
        await handler(
          { method: req.method, query, url: req.url, headers: req.headers },
          apiRes
        );
      } catch (error) {
        if (!res.headersSent) res.statusCode = 500;
        res.end(JSON.stringify({ error: (error as Error)?.message ?? "internal error" }));
      }
    };
  };

  // Handlers read process.env at call time; Vite only exposes VITE_* to the
  // client, so load the full env into the server process without leaking it.
  const primeEnv = (config: { mode: string; root: string }) => {
    const env = loadEnv(config.mode, config.root, "");
    for (const [key, value] of Object.entries(env)) {
      if (node.process.env[key] === undefined) node.process.env[key] = value;
    }
  };

  return {
    name: "portfolio-local-api",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      primeEnv(server.config);
      server.middlewares.use(middleware(server));
    },
    configurePreviewServer(server) {
      primeEnv(server.config);
      server.middlewares.use(middleware());
    },
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
});
