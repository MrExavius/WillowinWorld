import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  gameDevlogSources,
  loadLatestDevlogs,
  renderLlmsTxt,
  siteRoot
} from "./devlog-data.mjs";
import {
  alternateLinks,
  localizedPages,
  locales,
  outputFile,
  pageUrl,
  sourceLocale
} from "./localization-config.mjs";

const pages = Object.freeze([
  ...locales.flatMap(locale => localizedPages.map(source => ({
    file: outputFile(locale, source),
    sourceFile: source.file,
    canonical: pageUrl(locale, source),
    locale,
    source,
    game: source.kind === "game",
    policy: source.kind === "policy"
  }))),
  { file: "404.html", locale: sourceLocale, indexable: false }
]);

const errors = [];
const titles = new Map();
const descriptions = new Map();
const latestDevlogs = await loadLatestDevlogs();
const latestByFile = new Map(latestDevlogs.map(update => [update.file, update]));
const compactScriptLocales = new Set(["zh-hans", "zh-hant", "ja", "ko", "th"]);

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, "i"));
  return match?.[2] || "";
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

  if (attr(html.match(/<html\b[^>]*>/i)?.[0] || "", "lang") !== page.locale.htmlLang) {
    fail(page.file, `html lang must be ${page.locale.htmlLang}`);
  }
  if (isIndexable && attr(html.match(/<html\b[^>]*>/i)?.[0] || "", "dir") !== page.locale.direction) {
    fail(page.file, `html dir must be ${page.locale.direction}`);
  }
  if (!title) fail(page.file, "missing title");
  if (h1Count !== 1) fail(page.file, `expected exactly one h1, found ${h1Count}`);
  if (meta(html, "name", "keywords")) fail(page.file, "meta keywords must not be used");

  if (!isIndexable) {
    if (!robots.includes("noindex")) fail(page.file, "non-indexable page must declare noindex");
    if (canonicalTags.length) fail(page.file, "404 must not declare a canonical URL");
    continue;
  }

  if (!description) fail(page.file, "missing meta description");
  if (attr(meta(html, "http-equiv", "content-language") || "", "content") !== page.locale.htmlLang) {
    fail(page.file, `content-language must be ${page.locale.htmlLang}`);
  }
  const compactScript = compactScriptLocales.has(page.locale.code);
  const minimumTitleLength = compactScript ? 8 : (page.locale.code === sourceLocale.code ? 20 : 15);
  const maximumTitleLength = page.locale.code === sourceLocale.code ? 75 : 110;
  const minimumDescriptionLength = compactScript ? 30 : (page.locale.code === sourceLocale.code ? 70 : 50);
  const maximumDescriptionLength = page.locale.code === sourceLocale.code ? 180 : 250;
  if (title.length < minimumTitleLength || title.length > maximumTitleLength) {
    fail(page.file, `title length ${title.length} is outside ${minimumTitleLength}-${maximumTitleLength}`);
  }
  if (description.length < minimumDescriptionLength || description.length > maximumDescriptionLength) {
    fail(page.file, `description length ${description.length} is outside ${minimumDescriptionLength}-${maximumDescriptionLength}`);
  }
  const titleKey = `${page.locale.code}:${title}`;
  const descriptionKey = `${page.locale.code}:${description}`;
  if (titles.has(titleKey)) fail(page.file, `duplicates title from ${titles.get(titleKey)}`);
  if (descriptions.has(descriptionKey)) fail(page.file, `duplicates description from ${descriptions.get(descriptionKey)}`);
  titles.set(titleKey, page.file);
  descriptions.set(descriptionKey, page.file);

  if (!robots.includes("index") || !robots.includes("follow")) fail(page.file, "robots must include index and follow");
  if (canonicalTags.length !== 1 || attr(canonicalTags[0] || "", "href") !== page.canonical) {
    fail(page.file, "canonical must be unique and self-referencing");
  }

  const alternateTags = (html.match(/<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi) || []);
  if (alternateTags.length) fail(page.file, "hreflang must use the authoritative sitemap cluster, not duplicate HTML-head clusters");

  for (const property of ["og:type", "og:site_name", "og:locale", "og:title", "og:description", "og:image", "og:image:alt", "og:url"]) {
    if (!attr(meta(html, "property", property) || "", "content")) fail(page.file, `missing ${property}`);
  }
  if (attr(meta(html, "property", "og:url") || "", "content") !== page.canonical) fail(page.file, "og:url must match canonical");
  if (attr(meta(html, "property", "og:locale") || "", "content") !== page.locale.ogLocale) fail(page.file, `og:locale must be ${page.locale.ogLocale}`);
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) {
    if (!attr(meta(html, "name", name) || "", "content")) fail(page.file, `missing ${name}`);
  }

  const objects = structuredObjects(html, page.file);
  const organization = objects.find(object => hasType(object, "Organization") && object?.["@id"] === "https://willowinworld.com/#studio");
  if (page.source.kind === "home" && organization?.url !== "https://willowinworld.com/") {
    fail(page.file, "Organization must preserve one canonical studio URL across locales");
  }
  if (page.game) {
    const game = objects.find(object => hasType(object, "VideoGame"));
    const source = gameDevlogSources.find(candidate => candidate.file === page.sourceFile);
    if (!game) fail(page.file, "missing VideoGame JSON-LD");
    if (objects.some(object => hasType(object, "SoftwareApplication"))) fail(page.file, "unreleased game must not claim SoftwareApplication rich-result data");
    if (objects.some(object => hasType(object, "FAQPage"))) fail(page.file, "game FAQ schema must not diverge from visible FAQ content");
    if (game?.["@id"] !== `${page.canonical}#game`) fail(page.file, "VideoGame @id must be canonical#game");
    if (game?.author?.["@id"] !== "https://willowinworld.com/#studio") fail(page.file, "VideoGame author must reference #studio");
    if (game?.publisher?.["@id"] !== "https://willowinworld.com/#studio") fail(page.file, "VideoGame publisher must reference #studio");
    if (game?.inLanguage !== page.locale.htmlLang) fail(page.file, `VideoGame inLanguage must be ${page.locale.htmlLang}`);
    if (page.locale.code === sourceLocale.code) {
      if (source?.pageCanonical !== page.canonical) fail(page.file, "AI profile canonical must match the page canonical");
      if (game?.creativeWorkStatus !== source?.status) fail(page.file, "AI profile status must match VideoGame creativeWorkStatus");
      if (JSON.stringify(game?.genre) !== JSON.stringify(source?.genres)) fail(page.file, "AI profile genres must match VideoGame genres");
    }
    const latest = latestByFile.get(page.sourceFile);
    if (game?.dateModified !== latest?.published) fail(page.file, "dateModified must match the newest dated devlog");
  }

  if (page.policy) {
    const firstCardHeading = html.match(/<article class=["']detail-card["']><h([1-6])\b/i)?.[1];
    if (firstCardHeading !== "2") fail(page.file, "policy detail cards must begin at h2");
  }
}

const sitemap = await readFile(join(siteRoot, "sitemap.xml"), "utf8");
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (!/xmlns:xhtml=["']http:\/\/www\.w3\.org\/1999\/xhtml["']/.test(sitemap)) {
  fail("sitemap.xml", "missing XHTML namespace for multilingual alternates");
}
for (const page of pages.filter(page => page.indexable !== false)) {
  if (!sitemapLocs.includes(page.canonical)) fail("sitemap.xml", `missing ${page.canonical}`);
  const block = (sitemap.match(/<url>[\s\S]*?<\/url>/g) || [])
    .find(candidate => candidate.includes(`<loc>${page.canonical}</loc>`));
  const alternateTags = block?.match(/<xhtml:link\b[^>]*\/>/g) || [];
  const expectedAlternates = alternateLinks(page.source);
  for (const expected of expectedAlternates) {
    const match = alternateTags.find(tag => attr(tag, "hreflang") === expected.hreflang);
    if (!match || attr(match, "href") !== expected.href || attr(match, "rel") !== "alternate") {
      fail("sitemap.xml", `${page.canonical} missing reciprocal hreflang ${expected.hreflang}`);
    }
  }
  if (alternateTags.length !== expectedAlternates.length) {
    fail("sitemap.xml", `${page.canonical} expected ${expectedAlternates.length} hreflang links, found ${alternateTags.length}`);
  }
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
  "https://willowinworld.com/languages.json",
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
const wildcardGroup = robotsTxt
  .split(/\n\s*\n/)
  .find(candidate => /^User-agent:\s*\*$/mi.test(candidate));
if (!wildcardGroup) {
  fail("robots.txt", "missing wildcard crawler group");
} else {
  if (!/^Allow:\s*\/$/mi.test(wildcardGroup)) fail("robots.txt", "wildcard crawlers must be allowed on public pages");
  for (const protectedPath of ["/private/", "/admin/", "/api/"]) {
    if (!new RegExp(`^Disallow:\\s*${protectedPath.replaceAll("/", "\\/")}$`, "mi").test(wildcardGroup)) {
      fail("robots.txt", `wildcard crawlers must preserve the ${protectedPath} restriction`);
    }
  }
}
if (!/^Sitemap:\s*https:\/\/willowinworld\.com\/sitemap\.xml$/mi.test(robotsTxt)) {
  fail("robots.txt", "missing canonical sitemap declaration");
}
if (!robotsTxt.includes("https://willowinworld.com/llms.txt")) {
  fail("robots.txt", "missing llms.txt discovery comment");
}
if (!robotsTxt.includes("https://willowinworld.com/languages.json")) {
  fail("robots.txt", "missing multilingual discovery index comment");
}

const redirects = await readFile(join(siteRoot, "_redirects"), "utf8");
if (!/^\/index\.html\s+\/\s+301!$/m.test(redirects)) {
  fail("_redirects", "missing permanent English /index.html normalization");
}
if (!/^\/:locale\/index\.html\s+\/:locale\/\s+301!$/m.test(redirects)) {
  fail("_redirects", "missing permanent localized /index.html normalization");
}

let languageIndex;
try {
  languageIndex = JSON.parse(await readFile(join(siteRoot, "languages.json"), "utf8"));
} catch (error) {
  fail("languages.json", `invalid or missing language index (${error.message})`);
}
if (languageIndex) {
  if (languageIndex.defaultLanguage !== sourceLocale.htmlLang) fail("languages.json", "defaultLanguage must identify English");
  if (languageIndex.languages?.length !== locales.length) fail("languages.json", `expected ${locales.length} language records`);
  const homes = new Set();
  for (const locale of locales) {
    const record = languageIndex.languages?.find(candidate => candidate.code === locale.htmlLang);
    if (!record) {
      fail("languages.json", `missing ${locale.htmlLang}`);
      continue;
    }
    const expectedHome = pageUrl(locale, localizedPages[0]);
    const expectedLlms = locale.code === sourceLocale.code
      ? "https://willowinworld.com/llms.txt"
      : `https://willowinworld.com/${locale.code}/llms.txt`;
    if (record.hreflang !== locale.hreflang) fail("languages.json", `${locale.htmlLang} has incorrect hreflang`);
    if (record.direction !== locale.direction) fail("languages.json", `${locale.htmlLang} has incorrect direction`);
    if (record.home !== expectedHome) fail("languages.json", `${locale.htmlLang} has incorrect home URL`);
    if (record.llms !== expectedLlms) fail("languages.json", `${locale.htmlLang} has incorrect AI guide URL`);
    if (homes.has(record.home)) fail("languages.json", `${locale.htmlLang} duplicates a home URL`);
    homes.add(record.home);
  }
}

for (const locale of locales.filter(candidate => candidate.code !== sourceLocale.code)) {
  const file = `${locale.code}/llms.txt`;
  let localizedLlms = "";
  try {
    localizedLlms = await readFile(join(siteRoot, file), "utf8");
  } catch (error) {
    fail(file, `missing localized AI guide (${error.message})`);
    continue;
  }
  if (!localizedLlms.startsWith(`# WillowinWorld — ${locale.label}\n`)) fail(file, "must identify its native language");
  if (/___WILLOW_|__W\d+\s*__/.test(localizedLlms)) fail(file, "contains leaked translation placeholders");
  for (const game of gameDevlogSources) {
    const gamePage = localizedPages.find(page => page.file === game.file);
    if (!localizedLlms.includes(`](${pageUrl(locale, gamePage)})`)) fail(file, `missing localized ${game.name} link`);
  }
}

if (errors.length) {
  console.error(`SEO contract failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO and AI-discovery contract passed for ${pages.length} public HTML pages across ${locales.length} languages, multilingual sitemap.xml, robots.txt, languages.json and localized AI guides.`);
