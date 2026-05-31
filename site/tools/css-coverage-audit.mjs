import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const reportPath = join(siteRoot, "reports", "css-coverage.json");
const cssFiles = [
  "styles.css",
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
  "css/responsive-preferences.css",
  "css/responsive.css",
  "motion.css"
];
const css = (await Promise.all(cssFiles.map(file => readFile(join(siteRoot, file), "utf8")))).join("\n");
const files = [
  "index.html",
  "press-kit.html",
  "privacy.html",
  "legal.html",
  "asset-usage.html",
  "404.html",
  "scripts.js",
  "game-theme.js",
  "404.js",
  "games/nature-seed.html",
  "games/candy-shop.html",
  "games/paint-blasters.html",
  "games/ball-is-god.html"
];

let searchable = "";
for (const file of files) {
  searchable += "\n" + await readFile(join(siteRoot, file), "utf8");
}

const selectorText = [...css.matchAll(/([^{}]+)\{/g)]
  .map(match => match[1])
  .join("\n");

const classNames = new Set([...selectorText.matchAll(/\.([_a-zA-Z][\w-]*)/g)].map(match => match[1]));
const ids = new Set([...selectorText.matchAll(/#([_a-zA-Z][\w-]*)/g)].map(match => match[1]));

const probablyUnusedClasses = [...classNames]
  .filter(name => !searchable.includes(name))
  .sort();
const probablyUnusedIds = [...ids]
  .filter(name => !searchable.includes(name))
  .sort();

const report = {
  generatedAt: new Date().toISOString(),
  note: "Static scan only. Dynamic state classes, media-only selectors and pseudo selectors need manual review before deletion.",
  totals: {
    classSelectors: classNames.size,
    idSelectors: ids.size,
    probablyUnusedClasses: probablyUnusedClasses.length,
    probablyUnusedIds: probablyUnusedIds.length
  },
  probablyUnusedClasses,
  probablyUnusedIds
};

await mkdir(join(siteRoot, "reports"), { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(`CSS coverage audit written to ${reportPath}`);
