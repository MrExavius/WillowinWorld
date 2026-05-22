import { readFile } from "node:fs/promises";
import { exit } from "node:process";

const files = {
  html: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../styles.css", import.meta.url), "utf8"),
  js: await readFile(new URL("../scripts.js", import.meta.url), "utf8"),
  headers: await readFile(new URL("../_headers", import.meta.url), "utf8"),
  nginx: await readFile(new URL("../deploy/nginx-security.conf", import.meta.url), "utf8")
};

const errors = [];

function requireMatch(name, text, pattern) {
  if (!pattern.test(text)) errors.push(`${name}: missing ${pattern}`);
}

function forbidMatch(name, text, pattern) {
  if (pattern.test(text)) errors.push(`${name}: forbidden ${pattern}`);
}

requireMatch("index.html", files.html, /Content-Security-Policy/i);
requireMatch("index.html", files.html, /script-src 'self'/i);
requireMatch("index.html", files.html, /style-src 'self'/i);
requireMatch("_headers", files.headers, /frame-ancestors 'none'/i);
requireMatch("_headers", files.headers, /Strict-Transport-Security:/i);
requireMatch("_headers", files.headers, /X-Content-Type-Options:\s*nosniff/i);
requireMatch("nginx-security.conf", files.nginx, /X-Frame-Options\s+"DENY"/i);

forbidMatch("index.html", files.html, /<style(?:\s|>)/i);
forbidMatch("index.html", files.html, /<script(?![^>]*\bsrc=)/i);
forbidMatch("index.html", files.html, /\sstyle\s*=/i);
forbidMatch("index.html", files.html, /\son[a-z]+\s*=/i);
forbidMatch("index.html", files.html, /\b(?:href|src|action)\s*=\s*["'](?:https?:|\/\/|javascript:|data:text\/html)/i);
forbidMatch("scripts.js", files.js, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval|Function)\b/);
forbidMatch("scripts.js", files.js, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/);
forbidMatch("scripts.js", files.js, /\b(?:api[_-]?key|private[_-]?key|secret[_-]?key|bearer\s+[a-z0-9._-]+)\b/i);
forbidMatch("scripts.js", files.js, /\b[A-Z0-9]{3,}-(?:[A-Z0-9]+-){1,}[A-Z0-9]{2,}\b/);
forbidMatch("styles.css", files.css, /@import\s+url\s*\(/i);
forbidMatch("styles.css", files.css, /url\(\s*["']?(?:https?:|\/\/)/i);

if (errors.length) {
  console.error("WillowinWorld security check failed:");
  errors.forEach(error => console.error(`- ${error}`));
  exit(1);
}

console.log("WillowinWorld security check passed.");
