import { mkdir, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const reportRoot = join(siteRoot, "reports", "visual");
const tempRoot = join("/tmp", "willowinworld-visual-check");

const pages = [
  ["index", "index.html"],
  ["press-kit", "press-kit.html"],
  ["nature-seed", "games/nature-seed.html"],
  ["candy-shop", "games/candy-shop.html"],
  ["paint-blasters", "games/paint-blasters.html"],
  ["ball-is-god", "games/ball-is-god.html"],
  ["lost-stars-404", "404.html"],
  ["privacy", "privacy.html"],
  ["legal", "legal.html"],
  ["asset-usage", "asset-usage.html"]
];

const viewports = [
  ["desktop", 1365, 768],
  ["mobile", 390, 844]
];

function findCommand(candidates) {
  for (const command of candidates) {
    const result = spawnSync("which", [command], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  return null;
}

const browser = process.env.WILLOW_VISUAL_BROWSER
  || findCommand(["librewolf", "firefox", "brave", "brave-browser", "chromium", "chromium-browser", "google-chrome"]);
const magick = findCommand(["magick"]);

if (!browser) {
  console.error("No supported browser found. Set WILLOW_VISUAL_BROWSER or install LibreWolf/Firefox/Brave/Chromium.");
  process.exit(1);
}

function browserArgs({ profileDir, width, height, outPath, url }) {
  const name = browser.toLowerCase();
  if (name.includes("firefox") || name.includes("librewolf")) {
    return ["--headless", "--profile", profileDir, `--window-size=${width},${height}`, "--screenshot", outPath, url];
  }
  return ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--window-size=${width},${height}`, `--screenshot=${outPath}`, url];
}

function imageMetrics(file) {
  if (!magick) return null;
  const result = spawnSync(magick, [file, "-format", "%w %h %[fx:mean] %[fx:standard_deviation]", "info:"], {
    encoding: "utf8"
  });
  if (result.status !== 0) return null;
  const [width, height, mean, deviation] = result.stdout.trim().split(/\s+/).map(Number);
  return { width, height, mean, deviation };
}

async function createContactSheet(viewportSlug) {
  if (!magick) return;
  const imagePaths = pages.map(([pageSlug]) => resolve(reportRoot, `${pageSlug}-${viewportSlug}.png`));
  if (!imagePaths.every(existsSync)) {
    failures.push(`${viewportSlug}: cannot create contact sheet because a screenshot is missing`);
    return;
  }

  const outPath = resolve(reportRoot, `contact-${viewportSlug}.png`);
  await rm(outPath, { force: true });
  const desktop = viewportSlug === "desktop";
  const result = spawnSync(magick, [
    "montage",
    ...imagePaths,
    "-thumbnail", desktop ? "420x236" : "195x422",
    "-background", "#0b1020",
    "-font", "DejaVu-Sans",
    "-fill", "white",
    "-pointsize", desktop ? "18" : "16",
    "-set", "label", "%t",
    "-gravity", "center",
    "-geometry", desktop ? "420x280+12+18" : "210x470+10+16",
    outPath
  ], { encoding: "utf8" });

  if (result.status !== 0 || !existsSync(outPath)) {
    failures.push(`${viewportSlug}: contact sheet failed (${result.status ?? "no status"})`);
  }
}

await rm(tempRoot, { recursive: true, force: true });
await mkdir(reportRoot, { recursive: true });
await mkdir(tempRoot, { recursive: true });

const failures = [];

for (const [pageSlug, pagePath] of pages) {
  const htmlPath = join(siteRoot, pagePath);
  if (!existsSync(htmlPath)) {
    failures.push(`${pagePath}: missing page`);
    continue;
  }

  for (const [viewportSlug, width, height] of viewports) {
    const outPath = resolve(reportRoot, `${pageSlug}-${viewportSlug}.png`);
    const profileDir = join(tempRoot, `${pageSlug}-${viewportSlug}`);
    await rm(profileDir, { recursive: true, force: true });
    await mkdir(profileDir, { recursive: true });

    const url = pathToFileURL(htmlPath).href;
    const result = spawnSync(browser, browserArgs({ profileDir, width, height, outPath, url }), {
      cwd: dirname(siteRoot),
      encoding: "utf8"
    });

    if (result.status !== 0 || !existsSync(outPath)) {
      failures.push(`${pagePath} ${viewportSlug}: screenshot failed (${result.status ?? "no status"})`);
      continue;
    }

    const fileStats = await stat(outPath);
    if (fileStats.size < 1024) {
      failures.push(`${pagePath} ${viewportSlug}: screenshot too small (${fileStats.size} bytes)`);
      continue;
    }

    const metrics = imageMetrics(outPath);
    if (metrics) {
      if (metrics.width !== width || metrics.height !== height) {
        failures.push(`${pagePath} ${viewportSlug}: expected ${width}x${height}, got ${metrics.width}x${metrics.height}`);
      }
      if (!Number.isFinite(metrics.deviation) || metrics.deviation < 0.015) {
        failures.push(`${pagePath} ${viewportSlug}: screenshot looks blank (standard deviation ${metrics.deviation})`);
      }
    }
  }
}

for (const [viewportSlug] of viewports) {
  await createContactSheet(viewportSlug);
}

await rm(tempRoot, { recursive: true, force: true });

if (failures.length) {
  console.error("WillowinWorld visual check failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Visual screenshots written to ${reportRoot}`);
