import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const outRoot = join(siteRoot, "dist");

const staticFiles = [
  "assets",
  ".well-known",
  "deploy",
  "favicon.ico",
  "favicon.svg",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "rss.xml"
];

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
  "css/responsive.css",
  "motion.css",
  "404.css"
];

const sourceFiles = [
  "index.html",
  "press-kit.html",
  "privacy.html",
  "legal.html",
  "asset-usage.html",
  "404.html",
  ...cssFiles,
  "scripts.js",
  "game-theme.js",
  "404.js",
  "games/nature-seed.html",
  "games/candy-shop.html",
  "games/paint-blasters.html",
  "games/ball-is-god.html"
];

function minifyHtml(input) {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function minifyCss(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function minifyJs(input) {
  return input
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
}

function minifyByExtension(file, input) {
  const ext = extname(file);
  if (ext === ".html") return minifyHtml(input);
  if (ext === ".css") return minifyCss(input);
  if (ext === ".js") return minifyJs(input);
  return input;
}

await rm(outRoot, { recursive: true, force: true });
await mkdir(outRoot, { recursive: true });

for (const file of staticFiles) {
  await cp(join(siteRoot, file), join(outRoot, file), { recursive: true });
}

for (const file of sourceFiles) {
  const sourcePath = join(siteRoot, file);
  const outPath = join(outRoot, file);
  const source = await readFile(sourcePath, "utf8");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, minifyByExtension(file, source));
}

console.log(`Minified build written to ${relative(process.cwd(), outRoot) || outRoot}`);
