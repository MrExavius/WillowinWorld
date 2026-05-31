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

const sourceFiles = [
  "index.html",
  "press-kit.html",
  "privacy.html",
  "legal.html",
  "asset-usage.html",
  "404.html",
  "styles.css",
  "motion.css",
  "404.css",
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
