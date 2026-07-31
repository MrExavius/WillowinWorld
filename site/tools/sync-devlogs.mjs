import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  injectGameDateModified,
  injectHomepageDevlogs,
  injectSitemapDevlogDates,
  loadLatestDevlogs,
  renderDevlogRss,
  renderLlmsTxt,
  siteRoot
} from "./devlog-data.mjs";

const checkOnly = process.argv.includes("--check");
const indexPath = join(siteRoot, "index.html");
const rssPath = join(siteRoot, "rss.xml");
const llmsPath = join(siteRoot, "llms.txt");
const sitemapPath = join(siteRoot, "sitemap.xml");
const updates = await loadLatestDevlogs();
const currentIndex = await readFile(indexPath, "utf8");
const currentRss = await readFile(rssPath, "utf8");
const currentLlms = await readFile(llmsPath, "utf8");
const currentSitemap = await readFile(sitemapPath, "utf8");
const nextIndex = injectHomepageDevlogs(currentIndex, updates);
const nextRss = renderDevlogRss(updates);
const nextLlms = renderLlmsTxt(updates);
const nextSitemap = injectSitemapDevlogDates(currentSitemap, updates);
const staleFiles = [];
const gameWrites = [];

if (currentIndex !== nextIndex) staleFiles.push("site/index.html");
if (currentRss !== nextRss) staleFiles.push("site/rss.xml");
if (currentLlms !== nextLlms) staleFiles.push("site/llms.txt");
if (currentSitemap !== nextSitemap) staleFiles.push("site/sitemap.xml");

for (const update of updates) {
  const gamePath = join(siteRoot, update.file);
  const currentGame = await readFile(gamePath, "utf8");
  const nextGame = injectGameDateModified(currentGame, update);
  if (currentGame !== nextGame) {
    staleFiles.push(`site/${update.file}`);
    gameWrites.push([gamePath, nextGame]);
  }
}

if (checkOnly) {
  if (staleFiles.length) {
    console.error(`Devlog sync required: ${staleFiles.join(", ")}`);
    console.error("Run: node site/tools/sync-devlogs.mjs");
    process.exit(1);
  }
  console.log("Devlog sources, homepage, RSS and llms.txt are synchronized.");
  process.exit(0);
}

if (staleFiles.includes("site/index.html")) await writeFile(indexPath, nextIndex);
if (staleFiles.includes("site/rss.xml")) await writeFile(rssPath, nextRss);
if (staleFiles.includes("site/llms.txt")) await writeFile(llmsPath, nextLlms);
if (staleFiles.includes("site/sitemap.xml")) await writeFile(sitemapPath, nextSitemap);
for (const [gamePath, nextGame] of gameWrites) await writeFile(gamePath, nextGame);

console.log(staleFiles.length
  ? `Synchronized latest devlogs: ${staleFiles.join(", ")}`
  : "Devlogs are already synchronized.");
