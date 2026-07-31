import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { injectSitemapDevlogDates, loadLatestDevlogs, siteRoot } from "./devlog-data.mjs";

const checkOnly = process.argv.includes("--check");
const sitemapPath = join(siteRoot, "sitemap.xml");
const current = await readFile(sitemapPath, "utf8");
const next = injectSitemapDevlogDates(current, await loadLatestDevlogs());

if (current === next) {
  console.log("Sitemap devlog dates are current.");
  process.exit(0);
}

if (checkOnly) {
  console.error("Sitemap devlog dates are stale. Run: node site/tools/update-sitemap-lastmod.mjs");
  process.exit(1);
}

await writeFile(sitemapPath, next);
console.log("Updated sitemap dates from the newest dated game devlogs.");
