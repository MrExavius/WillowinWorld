import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { exit } from "node:process";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const cssFileNames = [
  "css/base.css",
  "css/nature-scene.css",
  "css/home-card-base.css",
  "css/home-ball-card.css",
  "css/home-nature-card.css",
  "css/home-paint-card.css",
  "css/home-candy-card.css",
  "css/game-components.css",
  "css/game-shell.css",
  "css/game-content.css",
  "css/nature-page.css",
  "css/candy-page.css",
  "css/paint-page.css",
  "css/ball-page.css",
  "css/press-kit.css",
  "css/site-sections.css",
  "css/keyframes.css",
  "css/responsive-desktop.css",
  "css/responsive-tablet.css",
  "css/responsive-mobile.css",
  "css/responsive-preferences.css"
];

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

const files = {
  html: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  cssFiles: Object.fromEntries(await Promise.all(cssFileNames.map(async file => [file, await readFile(new URL(`../${file}`, import.meta.url), "utf8")]))),
  motionCss: await readFile(new URL("../motion.css", import.meta.url), "utf8"),
  lostStarsCss: await readFile(new URL("../404.css", import.meta.url), "utf8"),
  js: await readFile(new URL("../scripts.js", import.meta.url), "utf8"),
  gameThemeJs: await readFile(new URL("../game-theme.js", import.meta.url), "utf8"),
  lostStarsJs: await readFile(new URL("../404.js", import.meta.url), "utf8"),
  headers: await readFile(new URL("../_headers", import.meta.url), "utf8"),
  nginx: await readFile(new URL("../deploy/nginx-security.conf", import.meta.url), "utf8"),
  apache: await readFile(new URL("../deploy/apache-security.htaccess", import.meta.url), "utf8"),
  securityTxt: await readFile(new URL("../.well-known/security.txt", import.meta.url), "utf8"),
  sitemap: await readFile(new URL("../sitemap.xml", import.meta.url), "utf8")
};

const errors = [];
const siteFiles = await walkFiles(siteRoot);
const htmlPages = {
  "index.html": files.html,
  "press-kit.html": await readFile(new URL("../press-kit.html", import.meta.url), "utf8"),
  "games/nature-seed.html": await readFile(new URL("../games/nature-seed.html", import.meta.url), "utf8"),
  "games/candy-shop.html": await readFile(new URL("../games/candy-shop.html", import.meta.url), "utf8"),
  "games/paint-blasters.html": await readFile(new URL("../games/paint-blasters.html", import.meta.url), "utf8"),
  "games/ball-is-god.html": await readFile(new URL("../games/ball-is-god.html", import.meta.url), "utf8"),
  "privacy.html": await readFile(new URL("../privacy.html", import.meta.url), "utf8"),
  "legal.html": await readFile(new URL("../legal.html", import.meta.url), "utf8"),
  "asset-usage.html": await readFile(new URL("../asset-usage.html", import.meta.url), "utf8"),
  "404.html": await readFile(new URL("../404.html", import.meta.url), "utf8")
};

function requireMatch(name, text, pattern) {
  if (!pattern.test(text)) errors.push(`${name}: missing ${pattern}`);
}

function forbidMatch(name, text, pattern) {
  if (pattern.test(text)) errors.push(`${name}: forbidden ${pattern}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getStructuredDataHash() {
  const match = files.html.match(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])(?=[^>]*\bid=["']structuredData["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) {
    errors.push("index.html: missing structuredData JSON-LD script");
    return null;
  }
  return `sha256-${createHash("sha256").update(match[1]).digest("base64")}`;
}

const structuredDataHash = getStructuredDataHash();

requireMatch("index.html", files.html, /Content-Security-Policy/i);
requireMatch("index.html", files.html, /script-src 'self'/i);
requireMatch("index.html", files.html, /style-src 'self'/i);
requireMatch("index.html", files.html, /application\/ld\+json/i);
requireMatch("index.html", files.html, /rel="canonical"\s+href="https:\/\/willowinworld\.com\/"/i);
requireMatch("index.html", files.html, /og:title/i);
requireMatch("index.html", files.html, /twitter:card/i);
requireMatch("sitemap.xml", files.sitemap, /https:\/\/willowinworld\.com\/press-kit\.html/i);
requireMatch("_headers", files.headers, /frame-ancestors 'none'/i);
requireMatch("_headers", files.headers, /Strict-Transport-Security:/i);
requireMatch("_headers", files.headers, /X-Content-Type-Options:\s*nosniff/i);
requireMatch("_headers", files.headers, /Origin-Agent-Cluster:\s*\?1/i);
requireMatch("_headers", files.headers, /X-Permitted-Cross-Domain-Policies:\s*none/i);
requireMatch("_headers", files.headers, /Cache-Control:\s*no-cache/i);
requireMatch("nginx-security.conf", files.nginx, /X-Frame-Options\s+"DENY"/i);
requireMatch("nginx-security.conf", files.nginx, /Origin-Agent-Cluster\s+"\?1"/i);
requireMatch("nginx-security.conf", files.nginx, /X-Permitted-Cross-Domain-Policies\s+"none"/i);
requireMatch("nginx-security.conf", files.nginx, /location\s+\^~\s+\/assets\/\s*\{[\s\S]*?expires\s+1y;/i);
requireMatch("nginx-security.conf", files.nginx, /location\s+~\*\s+\\\.html\$\s*\{[\s\S]*?expires\s+-1;/i);
forbidMatch("nginx-security.conf", files.nginx, /location\s+\^~\s+\/assets\/\s*\{[\s\S]*?add_header\s+Cache-Control/i);
requireMatch("apache-security.htaccess", files.apache, /X-Frame-Options\s+"DENY"/i);
requireMatch("apache-security.htaccess", files.apache, /Origin-Agent-Cluster\s+"\?1"/i);
requireMatch("apache-security.htaccess", files.apache, /X-Permitted-Cross-Domain-Policies\s+"none"/i);
requireMatch("apache-security.htaccess", files.apache, /ExpiresByType\s+text\/html\s+"access plus 0 seconds"/i);
requireMatch("security.txt", files.securityTxt, /Contact:\s*mailto:contact@willowinworld\.com/i);

if (structuredDataHash) {
  const hashPattern = new RegExp(escapeRegExp(structuredDataHash));
  requireMatch("index.html", files.html, hashPattern);
  requireMatch("_headers", files.headers, hashPattern);
  requireMatch("nginx-security.conf", files.nginx, hashPattern);
  requireMatch("apache-security.htaccess", files.apache, hashPattern);
}

for (const [name, html] of Object.entries(htmlPages)) {
  requireMatch(name, html, /Content-Security-Policy/i);
  requireMatch(name, html, /default-src 'self'/i);
  requireMatch(name, html, /script-src 'self'/i);
  forbidMatch(name, html, /unsafe-inline|unsafe-eval/i);
  forbidMatch(name, html, /<style(?:\s|>)/i);
  forbidMatch(name, html, /\sstyle\s*=/i);
  forbidMatch(name, html, /\son[a-z]+\s*=/i);
  forbidMatch(name, html, /Telegram placeholder|Discord placeholder|X\/Twitter placeholder|Decorative form placeholder|Real sending is not connected yet/i);

  const inlineScripts = [...html.matchAll(/<script\b([^>]*)>/gi)]
    .filter(([, attrs]) => !/\bsrc\s*=/.test(attrs))
    .filter(([, attrs]) => !/\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs));

  if (inlineScripts.length) {
    errors.push(`${name}: inline scripts are only allowed for JSON-LD with a CSP hash`);
  }

  const urlAttributes = [...html.matchAll(/\b(href|src|action)\s*=\s*["']([^"']+)/gi)];
  for (const [, attr, url] of urlAttributes) {
    const safeSameOrigin = attr.toLowerCase() === "href" && url.startsWith("https://willowinworld.com/");
    const unsafe = /^(https?:|\/\/|javascript:|data:text\/html)/i.test(url);
    if (unsafe && !safeSameOrigin) {
      errors.push(`${name}: unsafe ${attr} URL ${url}`);
    }
  }
}
for (const [name, js] of Object.entries({ "scripts.js": files.js, "game-theme.js": files.gameThemeJs, "404.js": files.lostStarsJs })) {
  forbidMatch(name, js, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval|Function)\b/);
  forbidMatch(name, js, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/);
  forbidMatch(name, js, /\b(?:api[_-]?key|private[_-]?key|secret[_-]?key|bearer\s+[a-z0-9._-]+)\b/i);
  forbidMatch(name, js, /\b[A-Z0-9]{3,}-(?:[A-Z0-9]+-){1,}[A-Z0-9]{2,}\b/);
}
for (const [name, css] of Object.entries({ ...files.cssFiles, "motion.css": files.motionCss, "404.css": files.lostStarsCss })) {
  forbidMatch(name, css, /@import\s+url\s*\(/i);
  forbidMatch(name, css, /url\(\s*["']?(?:https?:|\/\/)/i);
}

for (const file of siteFiles) {
  const relativePath = relative(siteRoot, file).replaceAll("\\", "/");
  if (/\.(?:fbx|prefab|psd|ai|fig|sketch|blend|unitypackage)$/i.test(relativePath)) {
    errors.push(`${relativePath}: raw/source asset must not be deployed`);
  }
  if (relativePath.startsWith("assets/")) {
    const { size } = await stat(file);
    if (size > 512 * 1024) {
      errors.push(`${relativePath}: asset exceeds 512 KiB performance budget`);
    }
  }
}

if (errors.length) {
  console.error("WillowinWorld security check failed:");
  errors.forEach(error => console.error(`- ${error}`));
  exit(1);
}

console.log("WillowinWorld security check passed.");
