#!/usr/bin/env node
// One-time Spotify OAuth helper for the Currently → Listening card.
//
// What it does: opens Spotify's consent screen, catches the redirect on
// 127.0.0.1:3000, exchanges the code for tokens, and writes the refresh
// token into .env.local as SPOTIFY_REFRESH_TOKEN.
//
// What you must do first (see README / .env.example):
//   1. Create an app at https://developer.spotify.com/dashboard
//   2. Add redirect URI exactly: http://127.0.0.1:3000/callback
//   3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
//
// Then run:  npm run spotify:auth
//
// Refresh tokens expire ~6 months after authorization. When /api/currently
// reports spotifyReauthRequired (invalid_grant), just run this again.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";

const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const PORT = 3000;
const SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
  // Playback control for the Listening card's tonearm (Web Playback SDK):
  // re-run this script after pulling these so the refresh token gains them.
  "streaming",
  "user-modify-playback-state",
  // Required by the Web Playback SDK itself: without these its internal
  // check_scope?scope=web-playback call 403s and the player raises
  // account_error/authentication_error (silent illustration-only mode).
  // Scopes bind at authorization time, so existing grants must re-auth.
  "user-read-email",
  "user-read-private",
];
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

function upsertEnvFile(file, key, value) {
  let contents = "";
  try {
    contents = fs.readFileSync(file, "utf8");
  } catch {
    contents = "";
  }
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
  contents = pattern.test(contents)
    ? contents.replace(pattern, line)
    : `${contents.replace(/\s*$/, "")}\n${line}\n`;
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
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.\n" +
      "Add them to .env.local (or export them) and run again."
  );
  process.exit(1);
}

const state = crypto.randomBytes(16).toString("hex");
const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES.join(" "),
    redirect_uri: REDIRECT_URI,
    state,
  }).toString();

async function exchangeCode(code) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.refresh_token) {
    throw new Error(body.error_description || body.error || `HTTP ${res.status}`);
  }
  return body;
}

function finish(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(
    `<!doctype html><meta charset="utf-8"><title>Spotify auth</title>` +
      `<body style="font:15px system-ui;padding:3rem;max-width:34rem;margin:auto">` +
      `<h1 style="font-size:1.1rem">${status === 200 ? "Done" : "Auth failed"}</h1>` +
      `<p>${message}</p></body>`
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (error) {
    finish(res, 400, `Spotify returned: ${error}. Re-run the command to try again.`);
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
    upsertEnvFile(ENV_PATH, "SPOTIFY_REFRESH_TOKEN", tokens.refresh_token);
    finish(res, 200, "Refresh token captured. You can close this tab and return to the terminal.");
    console.log("\n✓ Wrote SPOTIFY_REFRESH_TOKEN to .env.local");
    console.log("  Next: add the three SPOTIFY_* vars to your Vercel project env and redeploy.");
  } catch (err) {
    finish(res, 500, `Token exchange failed: ${err.message}`);
    console.error(`\n✗ Token exchange failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Opening Spotify consent screen…");
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
