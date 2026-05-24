import { readFile } from "node:fs/promises";
import { exit } from "node:process";

const files = {
  html: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../styles.css", import.meta.url), "utf8"),
  js: await readFile(new URL("../scripts.js", import.meta.url), "utf8"),
  gameThemeJs: await readFile(new URL("../game-theme.js", import.meta.url), "utf8"),
  headers: await readFile(new URL("../_headers", import.meta.url), "utf8"),
  nginx: await readFile(new URL("../deploy/nginx-security.conf", import.meta.url), "utf8"),
  sitemap: await readFile(new URL("../sitemap.xml", import.meta.url), "utf8")
};

const errors = [];
const htmlPages = {
  "index.html": files.html,
  "press-kit.html": await readFile(new URL("../press-kit.html", import.meta.url), "utf8"),
  "games/nature-seed.html": await readFile(new URL("../games/nature-seed.html", import.meta.url), "utf8"),
  "games/candy-shop.html": await readFile(new URL("../games/candy-shop.html", import.meta.url), "utf8"),
  "games/paint-blasters.html": await readFile(new URL("../games/paint-blasters.html", import.meta.url), "utf8"),
  "games/ball-is-god.html": await readFile(new URL("../games/ball-is-god.html", import.meta.url), "utf8"),
  "404.html": await readFile(new URL("../404.html", import.meta.url), "utf8")
};

function requireMatch(name, text, pattern) {
  if (!pattern.test(text)) errors.push(`${name}: missing ${pattern}`);
}

function forbidMatch(name, text, pattern) {
  if (pattern.test(text)) errors.push(`${name}: forbidden ${pattern}`);
}

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
requireMatch("nginx-security.conf", files.nginx, /X-Frame-Options\s+"DENY"/i);

for (const [name, html] of Object.entries(htmlPages)) {
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
for (const [name, js] of Object.entries({ "scripts.js": files.js, "game-theme.js": files.gameThemeJs })) {
  forbidMatch(name, js, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval|Function)\b/);
  forbidMatch(name, js, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/);
  forbidMatch(name, js, /\b(?:api[_-]?key|private[_-]?key|secret[_-]?key|bearer\s+[a-z0-9._-]+)\b/i);
  forbidMatch(name, js, /\b[A-Z0-9]{3,}-(?:[A-Z0-9]+-){1,}[A-Z0-9]{2,}\b/);
}
forbidMatch("styles.css", files.css, /@import\s+url\s*\(/i);
forbidMatch("styles.css", files.css, /url\(\s*["']?(?:https?:|\/\/)/i);

if (errors.length) {
  console.error("WillowinWorld security check failed:");
  errors.forEach(error => console.error(`- ${error}`));
  exit(1);
}

console.log("WillowinWorld security check passed.");
