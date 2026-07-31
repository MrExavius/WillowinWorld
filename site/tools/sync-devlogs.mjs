import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { injectHomepageDevlogs, loadLatestDevlogs, renderDevlogRss, siteRoot } from "./devlog-data.mjs";

const checkOnly = process.argv.includes("--check");
const indexPath = join(siteRoot, "index.html");
const rssPath = join(siteRoot, "rss.xml");
const updates = await loadLatestDevlogs();
const currentIndex = await readFile(indexPath, "utf8");
const currentRss = await readFile(rssPath, "utf8");
const nextIndex = injectHomepageDevlogs(currentIndex, updates);
const nextRss = renderDevlogRss(updates);
const staleFiles = [];

if (currentIndex !== nextIndex) staleFiles.push("site/index.html");
if (currentRss !== nextRss) staleFiles.push("site/rss.xml");

if (checkOnly) {
  if (staleFiles.length) {
    console.error(`Devlog sync required: ${staleFiles.join(", ")}`);
    console.error("Run: node site/tools/sync-devlogs.mjs");
    process.exit(1);
  }
  console.log("Devlog sources, homepage and RSS are synchronized.");
  process.exit(0);
}

if (staleFiles.includes("site/index.html")) await writeFile(indexPath, nextIndex);
if (staleFiles.includes("site/rss.xml")) await writeFile(rssPath, nextRss);

console.log(staleFiles.length
  ? `Synchronized latest devlogs: ${staleFiles.join(", ")}`
  : "Devlogs are already synchronized.");
