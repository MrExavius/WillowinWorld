import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  gameDevlogSources,
  loadLatestDevlogs,
  renderLlmsTxt,
  siteRoot
} from "./devlog-data.mjs";

const pages = Object.freeze([
  { file: "index.html", canonical: "https://willowinworld.com/" },
  { file: "games/nature-seed.html", canonical: "https://willowinworld.com/games/nature-seed.html", game: true },
  { file: "games/candy-shop.html", canonical: "https://willowinworld.com/games/candy-shop.html", game: true },
  { file: "games/paint-blasters.html", canonical: "https://willowinworld.com/games/paint-blasters.html", game: true },
  { file: "games/ball-is-god.html", canonical: "https://willowinworld.com/games/ball-is-god.html", game: true },
  { file: "press-kit.html", canonical: "https://willowinworld.com/press-kit.html" },
  { file: "privacy.html", canonical: "https://willowinworld.com/privacy.html", policy: true },
  { file: "legal.html", canonical: "https://willowinworld.com/legal.html", policy: true },
  { file: "asset-usage.html", canonical: "https://willowinworld.com/asset-usage.html", policy: true },
  { file: "404.html", indexable: false }
]);

const errors = [];
const titles = new Map();
const descriptions = new Map();
const latestDevlogs = await loadLatestDevlogs();
const latestByFile = new Map(latestDevlogs.map(update => [update.file, update]));

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match?.[1] || "";
}

function meta(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.find(tag => attr(tag, key).toLowerCase() === value.toLowerCase());
}

function text(value) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&mdash;|&#8212;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function structuredObjects(html, file) {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const objects = [];
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]);
      objects.push(...(Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed]));
    } catch (error) {
      fail(file, `invalid JSON-LD (${error.message})`);
    }
  }
  return objects;
}

function hasType(object, type) {
  const types = Array.isArray(object?.["@type"]) ? object["@type"] : [object?.["@type"]];
  return types.includes(type);
}

for (const page of pages) {
  const html = await readFile(join(siteRoot, page.file), "utf8");
  const isIndexable = page.indexable !== false;
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  const description = attr(meta(html, "name", "description") || "", "content");
  const robots = attr(meta(html, "name", "robots") || "", "content").toLowerCase();
  const canonicalTags = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi) || []);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (attr(html.match(/<html\b[^>]*>/i)?.[0] || "", "lang") !== "en") fail(page.file, "html lang must be en");
  if (!title) fail(page.file, "missing title");
  if (h1Count !== 1) fail(page.file, `expected exactly one h1, found ${h1Count}`);
  if (meta(html, "name", "keywords")) fail(page.file, "meta keywords must not be used");

  if (!isIndexable) {
    if (!robots.includes("noindex")) fail(page.file, "non-indexable page must declare noindex");
    if (canonicalTags.length) fail(page.file, "404 must not declare a canonical URL");
    continue;
  }

  if (!description) fail(page.file, "missing meta description");
  if (title.length < 20 || title.length > 75) fail(page.file, `title length ${title.length} is outside 20-75`);
  if (description.length < 80 || description.length > 180) fail(page.file, `description length ${description.length} is outside 80-180`);
  if (titles.has(title)) fail(page.file, `duplicates title from ${titles.get(title)}`);
  if (descriptions.has(description)) fail(page.file, `duplicates description from ${descriptions.get(description)}`);
  titles.set(title, page.file);
  descriptions.set(description, page.file);

  if (!robots.includes("index") || !robots.includes("follow")) fail(page.file, "robots must include index and follow");
  if (canonicalTags.length !== 1 || attr(canonicalTags[0] || "", "href") !== page.canonical) {
    fail(page.file, "canonical must be unique and self-referencing");
  }

  for (const property of ["og:type", "og:site_name", "og:locale", "og:title", "og:description", "og:image", "og:image:alt", "og:url"]) {
    if (!attr(meta(html, "property", property) || "", "content")) fail(page.file, `missing ${property}`);
  }
  if (attr(meta(html, "property", "og:url") || "", "content") !== page.canonical) fail(page.file, "og:url must match canonical");
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) {
    if (!attr(meta(html, "name", name) || "", "content")) fail(page.file, `missing ${name}`);
  }

  const objects = structuredObjects(html, page.file);
  if (page.game) {
    const game = objects.find(object => hasType(object, "VideoGame"));
    const source = gameDevlogSources.find(candidate => candidate.file === page.file);
    if (!game) fail(page.file, "missing VideoGame JSON-LD");
    if (objects.some(object => hasType(object, "SoftwareApplication"))) fail(page.file, "unreleased game must not claim SoftwareApplication rich-result data");
    if (objects.some(object => hasType(object, "FAQPage"))) fail(page.file, "game FAQ schema must not diverge from visible FAQ content");
    if (game?.["@id"] !== `${page.canonical}#game`) fail(page.file, "VideoGame @id must be canonical#game");
    if (game?.author?.["@id"] !== "https://willowinworld.com/#studio") fail(page.file, "VideoGame author must reference #studio");
    if (game?.publisher?.["@id"] !== "https://willowinworld.com/#studio") fail(page.file, "VideoGame publisher must reference #studio");
    if (source?.pageCanonical !== page.canonical) fail(page.file, "AI profile canonical must match the page canonical");
    if (game?.creativeWorkStatus !== source?.status) fail(page.file, "AI profile status must match VideoGame creativeWorkStatus");
    if (JSON.stringify(game?.genre) !== JSON.stringify(source?.genres)) fail(page.file, "AI profile genres must match VideoGame genres");
    const latest = latestByFile.get(page.file);
    if (game?.dateModified !== latest?.published) fail(page.file, "dateModified must match the newest dated devlog");
  }

  if (page.policy) {
    const firstCardHeading = html.match(/<article class=["']detail-card["']><h([1-6])\b/i)?.[1];
    if (firstCardHeading !== "2") fail(page.file, "policy detail cards must begin at h2");
  }
}

const sitemap = await readFile(join(siteRoot, "sitemap.xml"), "utf8");
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
for (const page of pages.filter(page => page.indexable !== false)) {
  if (!sitemapLocs.includes(page.canonical)) fail("sitemap.xml", `missing ${page.canonical}`);
}
if (sitemapLocs.some(loc => loc.endsWith("/404.html"))) fail("sitemap.xml", "must not include 404.html");

for (const update of latestByFile.values()) {
  const loc = update.canonical.replace(/#devlog$/, "");
  const block = (sitemap.match(/<url>[\s\S]*?<\/url>/g) || []).find(candidate => candidate.includes(`<loc>${loc}</loc>`));
  const lastmod = block?.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  if (lastmod !== update.published) fail("sitemap.xml", `${loc} lastmod must match its newest devlog`);
}

const llms = await readFile(join(siteRoot, "llms.txt"), "utf8");
if (llms !== renderLlmsTxt(latestDevlogs)) fail("llms.txt", "must be regenerated from the canonical game devlogs");
if ((llms.match(/^# /gm) || []).length !== 1 || !llms.startsWith("# WillowinWorld\n")) {
  fail("llms.txt", "must begin with one H1 naming WillowinWorld");
}
if (!/^> WillowinWorld is an independent mobile game studio/m.test(llms)) {
  fail("llms.txt", "must include a concise studio summary blockquote");
}
for (const game of gameDevlogSources) {
  if (!llms.includes(`[${game.name}](${game.pageCanonical})`)) fail("llms.txt", `missing canonical ${game.name} game link`);
  if (!llms.includes(`Genres: ${game.genres.join(", ")}.`)) fail("llms.txt", `missing factual ${game.name} genres`);
  if (!llms.includes(`Current status: ${game.status}.`)) fail("llms.txt", `missing factual ${game.name} status`);
}
for (const update of latestDevlogs) {
  if (!llms.includes(`](${update.canonical}): Published ${update.published}.`)) {
    fail("llms.txt", `missing current dated ${update.name} devlog link`);
  }
}
for (const requiredUrl of [
  "https://willowinworld.com/press-kit.html",
  "https://willowinworld.com/asset-usage.html",
  "https://willowinworld.com/rss.xml",
  "https://willowinworld.com/sitemap.xml",
  "mailto:contact@willowinworld.com"
]) {
  if (!llms.includes(`](${requiredUrl})`)) fail("llms.txt", `missing official resource ${requiredUrl}`);
}

const robotsTxt = await readFile(join(siteRoot, "robots.txt"), "utf8");
for (const crawler of ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "ChatGPT-User", "Perplexity-User", "Claude-User"]) {
  const group = robotsTxt
    .split(/\n\s*\n/)
    .find(candidate => new RegExp(`^User-agent:\\s*${crawler}$`, "mi").test(candidate));
  if (!group) {
    fail("robots.txt", `missing explicit public access group for ${crawler}`);
    continue;
  }
  if (!/^Allow:\s*\/$/mi.test(group)) fail("robots.txt", `${crawler} must be allowed on public pages`);
  if (/^Disallow:\s*\/$/mi.test(group)) fail("robots.txt", `${crawler} must not be blocked site-wide`);
  for (const protectedPath of ["/private/", "/admin/", "/api/"]) {
    if (!new RegExp(`^Disallow:\\s*${protectedPath.replaceAll("/", "\\/")}$`, "mi").test(group)) {
      fail("robots.txt", `${crawler} must preserve the ${protectedPath} restriction`);
    }
  }
}
if (!/^Sitemap:\s*https:\/\/willowinworld\.com\/sitemap\.xml$/mi.test(robotsTxt)) {
  fail("robots.txt", "missing canonical sitemap declaration");
}
if (!robotsTxt.includes("https://willowinworld.com/llms.txt")) {
  fail("robots.txt", "missing llms.txt discovery comment");
}

if (errors.length) {
  console.error(`SEO contract failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO and AI-discovery contract passed for ${pages.length} public HTML pages, sitemap.xml, robots.txt and llms.txt.`);
