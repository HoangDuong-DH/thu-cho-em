const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || "0.0.0.0"; // allow phone on same wifi
const ROOT = fs.realpathSync(__dirname);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "img-src 'self' data:",
    "media-src 'self' data:",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self'",
    "connect-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Method allow-list
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed", {
      "Content-Type": "text/plain; charset=utf-8",
      Allow: "GET, HEAD",
    });
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (e) {
    return send(res, 400, "Bad Request", { "Content-Type": "text/plain; charset=utf-8" });
  }

  if (urlPath === "/") urlPath = "/index.html";

  // Normalize & deny traversal, null bytes, dotfiles
  if (urlPath.includes("\0")) {
    return send(res, 400, "Bad Request", { "Content-Type": "text/plain; charset=utf-8" });
  }
  const normalized = path.posix.normalize(urlPath);
  if (normalized.startsWith("..") || normalized.split("/").some((seg) => seg.startsWith("."))) {
    return send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
  }

  const filePath = path.join(ROOT, normalized);
  let resolved;
  try {
    resolved = fs.realpathSync(filePath);
  } catch {
    return send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
  }
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
    return send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
    }
    const ext = path.extname(resolved).toLowerCase();
    const headers = {
      ...SECURITY_HEADERS,
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-store",
    };
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(resolved).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  const nets = require("os").networkInterfaces();
  const lanAddrs = [];
  Object.values(nets).forEach((iface) =>
    (iface || []).forEach((n) => {
      if (n.family === "IPv4" && !n.internal) lanAddrs.push(n.address);
    })
  );
  console.log(`Valentine site: http://localhost:${PORT}`);
  lanAddrs.forEach((a) => console.log(`  on phone (same wifi): http://${a}:${PORT}`));
});
