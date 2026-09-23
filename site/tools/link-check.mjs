import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const sameOrigin = "https://willowinworld.com";
const skippedDirectories = new Set(["dist", "reports"]);
const errors = [];

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch (error) {
    return pathname;
  }
}

function isSkippedUrl(url) {
  return !url
    || url.startsWith("#")
    || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(url)
    || /^\{/.test(url);
}

function splitFragment(url) {
  const hashIndex = url.indexOf("#");
  if (hashIndex < 0) return { beforeHash: url, fragment: "" };
  return {
    beforeHash: url.slice(0, hashIndex),
    fragment: url.slice(hashIndex + 1)
  };
}

function resolveLocalUrl(url, fromFile) {
  if (isSkippedUrl(url)) return null;

  let value = url.trim();
  if (!value || /\s/.test(value)) return null;

  const { beforeHash, fragment } = splitFragment(value);
  value = beforeHash.split("?")[0];

  if (!value && fragment) {
    return { file: fromFile, fragment };
  }

  if (/^https?:\/\//i.test(value)) {
    let parsed;
    try {
      parsed = new URL(value);
    } catch (error) {
      return null;
    }
    if (parsed.origin !== sameOrigin) return null;
    value = parsed.pathname;
  } else if (value.startsWith("//")) {
    return null;
  }

  if (value.startsWith("/")) {
    value = value.slice(1);
  } else {
    value = relative(siteRoot, resolve(dirname(fromFile), value)).replaceAll("\\", "/");
  }

  value = decodePathname(value);
  if (!value || value.endsWith("/")) value = join(value, "index.html").replaceAll("\\", "/");

  return { file: resolve(siteRoot, value), fragment };
}

function srcsetUrls(value) {
  return value
    .split(",")
    .map(candidate => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function collectIds(html) {
  return new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]));
}

function verifyLocalUrl(sourceName, attr, url, fromFile, htmlIdsByFile) {
  const resolved = resolveLocalUrl(url, fromFile);
  if (!resolved) return;

  if (!existsSync(resolved.file)) {
    errors.push(`${sourceName}: missing ${attr} target ${url}`);
    return;
  }

  if (resolved.fragment) {
    const ext = extname(resolved.file).toLowerCase();
    if (ext !== ".html") return;
    const ids = htmlIdsByFile.get(resolved.file);
    if (ids && !ids.has(resolved.fragment)) {
      errors.push(`${sourceName}: missing #${resolved.fragment} target in ${relative(siteRoot, resolved.file)}`);
    }
  }
}

const files = await walkFiles(siteRoot);
const htmlFiles = files.filter(file => extname(file).toLowerCase() === ".html");
const cssFiles = files.filter(file => extname(file).toLowerCase() === ".css");
const htmlByFile = new Map(await Promise.all(htmlFiles.map(async file => [file, await readFile(file, "utf8")])));
const htmlIdsByFile = new Map([...htmlByFile.entries()].map(([file, html]) => [file, collectIds(html)]));

for (const [file, html] of htmlByFile.entries()) {
  const sourceName = relative(siteRoot, file).replaceAll("\\", "/");

  for (const [, attr, value] of html.matchAll(/\b(href|src|poster|action|data-logo-light|data-logo-dark)\s*=\s*["']([^"']+)["']/gi)) {
    verifyLocalUrl(sourceName, attr, value, file, htmlIdsByFile);
  }

  for (const [, attr, value] of html.matchAll(/\b(srcset|imagesrcset|data-logo-light-srcset|data-logo-dark-srcset)\s*=\s*["']([^"']+)["']/gi)) {
    for (const url of srcsetUrls(value)) {
      verifyLocalUrl(sourceName, attr, url, file, htmlIdsByFile);
    }
  }

  for (const match of html.matchAll(/<meta\b[^>]*(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["'][^>]*\bcontent\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    verifyLocalUrl(sourceName, "meta image", match[1], file, htmlIdsByFile);
  }
}

for (const file of cssFiles) {
  const css = await readFile(file, "utf8");
  const sourceName = relative(siteRoot, file).replaceAll("\\", "/");
  for (const [, value] of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    verifyLocalUrl(sourceName, "url()", value, file, htmlIdsByFile);
  }
}

const manifestPath = join(siteRoot, "manifest.webmanifest");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const sourceName = "manifest.webmanifest";
  for (const icon of manifest.icons || []) {
    verifyLocalUrl(sourceName, "icons.src", icon.src, manifestPath, htmlIdsByFile);
  }
  for (const shortcut of manifest.shortcuts || []) {
    verifyLocalUrl(sourceName, "shortcuts.url", shortcut.url, manifestPath, htmlIdsByFile);
    for (const icon of shortcut.icons || []) {
      verifyLocalUrl(sourceName, "shortcuts.icons.src", icon.src, manifestPath, htmlIdsByFile);
    }
  }
}

for (const xmlName of ["rss.xml", "sitemap.xml"]) {
  const xmlPath = join(siteRoot, xmlName);
  if (!existsSync(xmlPath)) continue;
  const xml = await readFile(xmlPath, "utf8");
  for (const [, value] of xml.matchAll(/<(?:loc|link)>([^<]+)<\/(?:loc|link)>/gi)) {
    verifyLocalUrl(xmlName, "xml link", value.trim(), xmlPath, htmlIdsByFile);
  }
}

if (errors.length) {
  console.error("WillowinWorlds link check failed:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("WillowinWorlds link check passed.");
