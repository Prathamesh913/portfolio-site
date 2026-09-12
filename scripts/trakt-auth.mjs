#!/usr/bin/env node
// One-time Trakt OAuth helper for the Currently → Watching card.
//
// Why OAuth: anonymous API calls only see public profiles. Authorizing as
// yourself lets /api/currently read your history via /users/me regardless
// of profile-privacy toggles.
//
// What you must do first:
//   1. Open your app at https://trakt.tv/oauth/applications
//   2. Add redirect URI exactly: http://127.0.0.1:3000/trakt-callback
//   3. Put TRAKT_CLIENT_ID and TRAKT_CLIENT_SECRET in .env.local
//
// Then run:  npm run trakt:auth
//
// It opens Trakt's consent screen, catches the callback, and writes
// TRAKT_ACCESS_TOKEN + TRAKT_ACCESS_EXPIRES_AT + TRAKT_REFRESH_TOKEN into
// .env.local. Access tokens last ~90 days; re-run when the Watching card
// stops going live (the script safely rotates and re-persists everything).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";

const REDIRECT_URI = "http://127.0.0.1:3000/trakt-callback";
const PORT = 3000;
const ENV_PATH = path.resolve(process.cwd(), ".env.local");

function readEnvFile(file) {
  const vars = {};
  try {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match) vars[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local yet — that's fine, expect process.env instead.
  }
  return vars;
}

function upsertEnvFile(file, entries) {
  let contents = "";
  try {
    contents = fs.readFileSync(file, "utf8");
  } catch {
    contents = "";
  }
  for (const [key, value] of entries) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
    contents = pattern.test(contents)
      ? contents.replace(pattern, line)
      : `${contents.replace(/\s*$/, "")}\n${line}\n`;
  }
  fs.writeFileSync(file, contents, "utf8");
}

function openBrowser(url) {
  const opener =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  execFile(opener, args, () => {
    // Headless or no handler — the URL is printed anyway.
  });
}

const env = { ...readEnvFile(ENV_PATH), ...process.env };
const clientId = env.TRAKT_CLIENT_ID;
const clientSecret = env.TRAKT_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Missing TRAKT_CLIENT_ID / TRAKT_CLIENT_SECRET.\n" +
      "Add them to .env.local (or export them) and run again."
  );
  process.exit(1);
}

const state = crypto.randomBytes(16).toString("hex");
const authorizeUrl =
  "https://trakt.tv/oauth/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    state,
  }).toString();

async function exchangeCode(code) {
  // Trakt's bot protection intermittently 403s datacenter IPs — one retry
  // after a short wait gets through the flapping.
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch("https://api.trakt.tv/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "User-Agent": "portfolio-currently/1.0",
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.access_token) return body;
    lastError = new Error(body.error_description || body.error || `HTTP ${res.status}`);
    if (attempt === 1) await new Promise((r) => setTimeout(r, 5000));
  }
  throw lastError;
}

function finish(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(
    `<!doctype html><meta charset="utf-8"><title>Trakt auth</title>` +
      `<body style="font:15px system-ui;padding:3rem;max-width:34rem;margin:auto">` +
      `<h1 style="font-size:1.1rem">${status === 200 ? "Done" : "Auth failed"}</h1>` +
      `<p>${message}</p></body>`
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/trakt-callback") {
    res.writeHead(404).end();
    return;
  }
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (error) {
    finish(res, 400, `Trakt returned: ${error}. Re-run the command to try again.`);
    server.close();
    process.exitCode = 1;
    return;
  }
  if (!code || returnedState !== state) {
    finish(res, 400, "Missing code or state mismatch. Re-run the command to try again.");
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const tokens = await exchangeCode(code);
    const expiresAt = Date.now() + (tokens.expires_in ?? 7776000) * 1000;
    upsertEnvFile(ENV_PATH, [
      ["TRAKT_ACCESS_TOKEN", tokens.access_token],
      ["TRAKT_ACCESS_EXPIRES_AT", String(expiresAt)],
      ["TRAKT_REFRESH_TOKEN", tokens.refresh_token],
    ]);
    finish(res, 200, "Tokens captured. You can close this tab and return to the terminal.");
    console.log("\n✓ Wrote TRAKT_ACCESS_TOKEN / TRAKT_ACCESS_EXPIRES_AT / TRAKT_REFRESH_TOKEN to .env.local");
    console.log("  Next: add the TRAKT_* vars to your Vercel project env and redeploy.");
  } catch (err) {
    finish(res, 500, `Token exchange failed: ${err.message}`);
    console.error(`\n✗ Token exchange failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Opening Trakt consent screen…");
  console.log(`If it doesn't open, visit:\n\n${authorizeUrl}\n`);
  openBrowser(authorizeUrl);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is busy. Close whatever is using it and run again.`);
    process.exit(1);
  }
  throw err;
});
