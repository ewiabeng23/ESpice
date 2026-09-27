// Local development server: `npm run dev`
// Serves the site and runs the /api functions the same way Vercel does.
// No login or extra installs needed. Reads secrets from .env.local.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

// ---- load .env.local (or .env) into process.env ----
for (const file of [".env.local", ".env"]) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
};
const BLOCKED = /^\/(api|node_modules|tests|\.)|^\/(dev-server\.js|package(-lock)?\.json|\.env.*)$/;

function vercelResponse(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)); return res; };
  res.send = (body) => { res.end(typeof body === "string" ? body : JSON.stringify(body)); return res; };
  return res;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on("end", () => {
      const type = req.headers["content-type"] || "";
      if (type.includes("application/json")) { try { return resolve(JSON.parse(data || "{}")); } catch { return resolve(data); } }
      resolve(data);
    });
  });
}

// Reload function code and shop.js on every request, so edits show up without restarting.
function freshRequire(file) {
  for (const k of Object.keys(require.cache)) if (!k.includes("node_modules")) delete require.cache[k];
  return require(file);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const started = Date.now();
  res.on("finish", () => console.log(`${res.statusCode} ${req.method} ${url.pathname} ${Date.now() - started}ms`));

  // ---- API routes: /api/name -> api/name.js ----
  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5).replace(/[^a-z0-9-_]/gi, "");
    const file = path.join(ROOT, "api", `${name}.js`);
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end("Not found"); }
    try {
      req.body = await readBody(req);
      req.query = Object.fromEntries(url.searchParams);
      await freshRequire(file)(req, vercelResponse(res));
    } catch (err) {
      console.error(err);
      if (!res.headersSent) { res.statusCode = 500; res.end("Function crashed: " + err.message); }
    }
    return;
  }

  // ---- static files ----
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  if (BLOCKED.test(pathname)) { res.statusCode = 404; return res.end("Not found"); }
  const file = path.normalize(path.join(ROOT, pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404; return res.end("Not found");
  }
  res.setHeader("Content-Type", TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  const key = process.env.STRIPE_SECRET_KEY || "";
  console.log(`\n  ESpice running at http://localhost:${PORT}\n`);
  if (!key) console.log("  ! No STRIPE_SECRET_KEY found. Copy .env.example to .env.local and add your test key.\n");
  else if (key.startsWith("sk_live_")) console.log("  ! You're using a LIVE Stripe key locally. Real cards will be charged.\n");
  else console.log("  Stripe test mode is on. Pay with card 4242 4242 4242 4242.\n");
});
