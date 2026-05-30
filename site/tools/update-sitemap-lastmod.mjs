import { readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(siteDir, "sitemap.xml");
const origin = "https://willowinworld.com/";

function localPathForUrl(url) {
  if (!url.startsWith(origin)) return null;
  const pathname = new URL(url).pathname;
  if (pathname === "/") return path.join(siteDir, "index.html");
  return path.join(siteDir, decodeURIComponent(pathname.replace(/^\//, "")));
}

function toDateStamp(date) {
  return date.toISOString().slice(0, 10);
}

let sitemap = await readFile(sitemapPath, "utf8");
const blocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) || [];

for (const block of blocks) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  const file = loc ? localPathForUrl(loc) : null;
  if (!file) continue;

  try {
    const fileStat = await stat(file);
    const next = block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${toDateStamp(fileStat.mtime)}</lastmod>`);
    sitemap = sitemap.replace(block, next);
  } catch {
    process.stderr.write(`Skipping missing sitemap target: ${loc}\n`);
  }
}

await writeFile(sitemapPath, sitemap);
