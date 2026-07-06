const fs = require("fs");
const http = require("http");
const path = require("path");
const interestHandler = require("./api/interest");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || "0.0.0.0";
const TAILSCALE_IP = process.env.TAILSCALE_IP || "100.88.250.6";
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function loadLocalEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separator = trimmed.indexOf("=");
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

function send(response, statusCode, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(body);
}

function getStaticPath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const normalizedPath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  const filePath = path.normalize(path.join(ROOT, normalizedPath));

  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function serveStatic(request, response) {
  const filePath = getStaticPath(request.url);
  if (!filePath) {
    send(response, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(response, 404, "Not found");
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    const cacheControl = filePath.includes(`${path.sep}images${path.sep}optimized${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-store";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl
    });
    response.end(data);
  });
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function routeApi(request, response) {
  try {
    loadLocalEnv();
    request.body = await parseJsonBody(request);
    await interestHandler(request, response);
  } catch {
    send(response, 400, JSON.stringify({ error: "Invalid JSON body" }), "application/json; charset=utf-8");
  }
}

loadLocalEnv();

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/interest")) {
    routeApi(request, response);
    return;
  }

  serveStatic(request, response);
});

server.listen(PORT, HOST, () => {
  console.log(`JAUNE local test server: http://127.0.0.1:${PORT}/`);
  console.log(`Tailscale URL: http://${TAILSCALE_IP}:${PORT}/`);
  console.log("Use this URL instead of file:// so /api/interest can write to Airtable.");
});
