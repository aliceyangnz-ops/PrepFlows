/**
 * Standalone production server for Expo static builds.
 *
 * Serves the output of build.js (static-build/) with:
 * - GET /robots.txt          → allow all crawlers
 * - GET /sitemap.xml         → basic sitemap
 * - GET / or /manifest with expo-platform header → platform manifest JSON
 * - GET / without expo-platform → landing page HTML (with SEO headers)
 * Everything else falls through to static file serving from ./static-build/
 * with long-lived cache headers for hashed assets.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const TEMPLATE_PATH = path.resolve(__dirname, "templates", "landing-page.html");
const TEMPLATE_ANDROID_PATH = path.resolve(__dirname, "templates", "landing-page-android.html");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

function isAndroidUA(req) {
  const ua = req.headers["user-agent"] || "";
  return /Android/i.test(ua);
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".otf":  "font/otf",
  ".map":  "application/json",
  ".txt":  "text/plain; charset=utf-8",
  ".xml":  "application/xml; charset=utf-8",
};

function getCacheControl(ext) {
  if ([".js", ".css", ".woff", ".woff2", ".ttf", ".otf", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico"].includes(ext)) {
    return "public, max-age=31536000, immutable";
  }
  if (ext === ".html") return "public, max-age=0, must-revalidate";
  return "public, max-age=3600";
}

function getAppName() {
  try {
    const appJsonPath = path.resolve(__dirname, "..", "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    return appJson.expo?.name || "PrepFlows";
  } catch {
    return "PrepFlows";
  }
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: `Manifest not found for platform: ${platform}` }));
    return;
  }
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

async function serveLandingPage(req, res, templates, appName) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const baseUrl = `${protocol}://${host}`;
  const deepLink = `exps://${host}`;

  const template = isAndroidUA(req) ? templates.android : templates.default;

  let qrSvg = "";
  try {
    qrSvg = await QRCode.toString(deepLink, {
      type: "svg",
      width: 200,
      margin: 1,
      color: { dark: "#1a1a2e", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
  } catch {
    qrSvg = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="#eee"/></svg>`;
  }

  const html = template
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/DEEP_LINK_PLACEHOLDER/g, deepLink)
    .replace(/QR_CODE_SVG_PLACEHOLDER/g, qrSvg)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=0, must-revalidate",
    "x-robots-tag": "index, follow",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "vary": "User-Agent",
  });
  res.end(html);
}

function serveRobotsTxt(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const sitemapUrl = `${protocol}://${host}${basePath}/sitemap.xml`;

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
  ].join("\n");

  res.writeHead(200, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "public, max-age=86400",
    "x-robots-tag": "noindex",
  });
  res.end(body);
}

function serveSitemapXml(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const baseUrl = `${protocol}://${host}${basePath}`;
  const today = new Date().toISOString().slice(0, 10);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  res.writeHead(200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, max-age=86400",
  });
  res.end(xml);
}

function serveStaticFile(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safePath);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);

  const extraHeaders = {};
  if (ext === ".html") {
    extraHeaders["x-robots-tag"] = "index, follow";
  }

  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": getCacheControl(ext),
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  });
  res.end(content);
}

const templates = {
  default: fs.readFileSync(TEMPLATE_PATH, "utf-8"),
  android: fs.readFileSync(TEMPLATE_ANDROID_PATH, "utf-8"),
};
const appName = getAppName();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  if (pathname === "/robots.txt") return serveRobotsTxt(req, res);
  if (pathname === "/sitemap.xml") return serveSitemapXml(req, res);

  if (pathname === "/" || pathname === "/manifest") {
    const platform = req.headers["expo-platform"];
    if (platform === "ios" || platform === "android") {
      return serveManifest(platform, res);
    }
    if (pathname === "/") {
      serveLandingPage(req, res, templates, appName).catch((err) => {
        console.error("Landing page error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "content-type": "text/plain" });
          res.end("Internal Server Error");
        }
      });
      return;
    }
  }

  serveStaticFile(pathname, res);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving static Expo build on port ${port}`);
});
