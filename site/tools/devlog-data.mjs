import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));

export const gameDevlogSources = Object.freeze([
  Object.freeze({
    id: "nature-seed",
    name: "Nature Seed",
    file: "games/nature-seed.html",
    href: "games/nature-seed.html#devlog",
    canonical: "https://willowinworld.com/games/nature-seed.html#devlog",
    pageCanonical: "https://willowinworld.com/games/nature-seed.html",
    status: "Released",
    genres: Object.freeze(["Draw-to-solve puzzle", "Physics puzzle", "Relaxing puzzle", "Line drawing puzzle"]),
    machineSummary: "A released mobile draw-to-solve physics puzzle. Released on 10 September 2026 as Nature Seed, it asks players to draw an ink-limited physical path, reunite Water Drop and Seed, and restore a watercolor forest across 10 launch levels."
  }),
  Object.freeze({
    id: "candy-shop",
    name: "Candy Shop",
    file: "games/candy-shop.html",
    href: "games/candy-shop.html#devlog",
    canonical: "https://willowinworld.com/games/candy-shop.html#devlog",
    pageCanonical: "https://willowinworld.com/games/candy-shop.html",
    status: "Active development - playable production build",
    genres: Object.freeze(["Merge puzzle", "Candy puzzle", "Casual puzzle", "Physics puzzle"]),
    machineSummary: "A cozy mobile merge puzzle with a 13-stage candy chain, 10 container rulesets, eight special-candy effects and planning tools for the next drop."
  }),
  Object.freeze({
    id: "paint-blasters",
    name: "Paint Blasters",
    file: "games/paint-blasters.html",
    href: "games/paint-blasters.html#devlog",
    canonical: "https://willowinworld.com/games/paint-blasters.html#devlog",
    pageCanonical: "https://willowinworld.com/games/paint-blasters.html",
    status: "Active development - production prototype",
    genres: Object.freeze(["Color puzzle", "Physics arcade", "Destruction puzzle", "Chain reaction"]),
    machineSummary: "A mobile color-destruction physics puzzle arcade. Combine three color inputs into 35 authored projectile recipes, target tower weak points and trigger chain reactions."
  }),
  Object.freeze({
    id: "ball-is-god",
    name: "Ball is God?!",
    file: "games/ball-is-god.html",
    href: "games/ball-is-god.html#devlog",
    canonical: "https://willowinworld.com/games/ball-is-god.html#devlog",
    pageCanonical: "https://willowinworld.com/games/ball-is-god.html",
    status: "Active production",
    genres: Object.freeze(["Vertical descent arcade", "Hardcore arcade", "Story-driven arcade", "Boss action"]),
    machineSummary: "A story-driven hardcore vertical-descent mobile arcade. Rotate the tower around Espa, build combo smashes, survive bosses and carry karma choices through 10 mythic locations."
  })
]);

const namedEntities = Object.freeze({
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: "\""
});

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&(amp|apos|gt|lt|quot);/g, (_, name) => namedEntities[name]);
}

function plainText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function requireText(value, field, game, maximumLength) {
  const normalized = plainText(value || "");
  if (!normalized) throw new Error(`${game}: latest devlog ${field} is empty`);
  if (normalized.length > maximumLength) {
    throw new Error(`${game}: latest devlog ${field} exceeds ${maximumLength} characters`);
  }
  return normalized;
}

function parsePublishedDate(value, game) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    throw new Error(`${game}: data-published must use YYYY-MM-DD`);
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) throw new Error(`${game}: invalid data-published date ${value}`);
  return timestamp;
}

function parseDevlogEntries(html, source) {
  const section = html.match(/<section\b[^>]*\bid=["']devlog["'][^>]*>([\s\S]*?)<\/section>/i);
  if (!section) throw new Error(`${source.name}: missing #devlog section in ${source.file}`);

  const entries = [];
  const itemPattern = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
  let itemMatch;

  while ((itemMatch = itemPattern.exec(section[1]))) {
    const attributes = itemMatch[1];
    if (!/\bdata-devlog-entry(?:\s|=|$)/i.test(attributes)) continue;

    const published = attributes.match(/\bdata-published=["']([^"']+)["']/i)?.[1] || "";
    const timestamp = parsePublishedDate(published, source.name);
    const body = itemMatch[2];
    const time = body.match(/<time\b([^>]*)>([\s\S]*?)<\/time>/i);
    const timeDate = time?.[1].match(/\bdatetime=["']([^"']+)["']/i)?.[1] || "";
    if (timeDate !== published) {
      throw new Error(`${source.name}: <time datetime> must match data-published ${published}`);
    }

    entries.push(Object.freeze({
      ...source,
      published,
      timestamp,
      dateLabel: requireText(time?.[2], "date label", source.name, 40),
      title: requireText(body.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i)?.[1], "title", source.name, 120),
      summary: requireText(body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1], "summary", source.name, 600)
    }));
  }

  if (!entries.length) {
    throw new Error(`${source.name}: add at least one [data-devlog-entry] inside #devlog`);
  }

  return entries.sort((left, right) => right.timestamp - left.timestamp);
}

export async function loadLatestDevlogs() {
  return Promise.all(gameDevlogSources.map(async source => {
    const html = await readFile(new URL(`../${source.file}`, import.meta.url), "utf8");
    return parseDevlogEntries(html, source)[0];
  }));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

export function renderHomepageDevlogs(updates) {
  return updates.map(update => [
    `            <article class="devlog-card" data-devlog-card data-devlog-game="${escapeHtml(update.id)}" data-devlog-source="${escapeHtml(update.file)}">`,
    `              <span><b data-devlog-name>${escapeHtml(update.name)}</b><time datetime="${update.published}" data-devlog-date>${escapeHtml(update.dateLabel)}</time></span>`,
    `              <h3 data-devlog-title>${escapeHtml(update.title)}</h3>`,
    `              <p data-devlog-summary>${escapeHtml(update.summary)}</p>`,
    `              <a class="btn btn-ghost" href="${escapeHtml(update.href)}" aria-label="Open ${escapeHtml(update.name)} devlog">Open ${escapeHtml(update.name)} devlog</a>`,
    "            </article>"
  ].join("\n")).join("\n");
}

export function injectHomepageDevlogs(html, updates) {
  const start = "            <!-- latest-devlogs:start -->";
  const end = "            <!-- latest-devlogs:end -->";
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error("index.html: missing or invalid latest-devlogs markers");
  }

  const before = html.slice(0, startIndex + start.length);
  const after = html.slice(endIndex);
  return `${before}\n${renderHomepageDevlogs(updates)}\n${after}`;
}

export function injectGameDateModified(html, update) {
  const pattern = /(\"dateModified\"\s*:\s*\")[^\"]+(\")/;
  if (!pattern.test(html)) {
    throw new Error(`${update.file}: missing dateModified in JSON-LD`);
  }
  return html.replace(pattern, `$1${update.published}$2`);
}

function replaceSitemapLastmod(xml, loc, date) {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  const block = blocks.find(candidate => candidate.includes(`<loc>${loc}</loc>`));
  if (!block) throw new Error(`sitemap.xml: missing ${loc}`);
  if (!/<lastmod>[^<]+<\/lastmod>/.test(block)) {
    throw new Error(`sitemap.xml: missing lastmod for ${loc}`);
  }
  return xml.replace(block, block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${date}</lastmod>`));
}

export function injectSitemapDevlogDates(xml, updates) {
  const newest = [...updates].sort((left, right) => right.timestamp - left.timestamp)[0];
  let next = replaceSitemapLastmod(xml, "https://willowinworld.com/", newest.published);
  for (const update of updates) {
    const gameUrl = update.canonical.replace(/#devlog$/, "");
    next = replaceSitemapLastmod(next, gameUrl, update.published);
  }
  return next;
}

function formatRssDate(published) {
  const [year, month, day] = published.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${weekdays[date.getUTCDay()]}, ${String(day).padStart(2, "0")} ${months[month - 1]} ${year} 00:00:00 +0300`;
}

export function renderDevlogRss(updates) {
  const ordered = [...updates].sort((left, right) => right.timestamp - left.timestamp);
  const lastBuildDate = formatRssDate(ordered[0].published);
  const items = ordered.map(update => [
    "    <item>",
    `      <title>${escapeXml(update.name)}: ${escapeXml(update.title)}</title>`,
    `      <link>${escapeXml(update.canonical)}</link>`,
    `      <guid>${escapeXml(update.canonical)}-${update.published}</guid>`,
    `      <pubDate>${formatRssDate(update.published)}</pubDate>`,
    `      <description>${escapeXml(update.summary)}</description>`,
    "    </item>"
  ].join("\n")).join("\n");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>WillowinWorld Devlog</title>
    <link>https://willowinworld.com/#devlog</link>
    <description>Latest production notes for WillowinWorld mobile games.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function escapeMarkdown(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}

export function renderLlmsTxt(updates) {
  const ordered = [...updates].sort((left, right) => right.timestamp - left.timestamp);
  const latestDate = ordered[0]?.published;
  if (!latestDate) throw new Error("llms.txt: at least one current devlog is required");

  const games = gameDevlogSources.map(game =>
    `- [${escapeMarkdown(game.name)}](${game.pageCanonical}): ${escapeMarkdown(game.machineSummary)} Genres: ${game.genres.map(escapeMarkdown).join(", ")}. Current status: ${escapeMarkdown(game.status)}.`
  ).join("\n");

  const devlogs = ordered.map(update =>
    `- [${escapeMarkdown(update.name)} - ${escapeMarkdown(update.title)}](${update.canonical}): Published ${update.published}. ${escapeMarkdown(update.summary)}`
  ).join("\n");

  return `# WillowinWorld

> WillowinWorld is an independent mobile game studio creating four physics-led puzzle and arcade games with tactile controls, readable systems and expressive 2D worlds.

Nature Seed is released; the other three games are currently in development. The canonical game pages below are the source of truth for genre, scope, production status, characters, gameplay and media assets. Nature Seed lists its 2026-09-10 release date; no public price, store availability, rating or review score is claimed unless it is explicitly published on those pages. Site language: English. Latest source update: ${latestDate}.

## Games

${games}

## Latest development notes

${devlogs}

## Studio and press

- [Official WillowinWorld website](https://willowinworld.com/): Studio overview, complete game portfolio and current production notes.
- [Press and creator kit](https://willowinworld.com/press-kit.html): Factual studio and game summaries, production statuses and downloadable editorial assets.
- [Media asset usage](https://willowinworld.com/asset-usage.html): Rules for using WillowinWorld screenshots, logos and character artwork.

## Feeds and policies

- [Devlog RSS feed](https://willowinworld.com/rss.xml): Latest dated production notes for all four games.
- [XML sitemap](https://willowinworld.com/sitemap.xml): Canonical indexable pages and their current modification dates.
- [Language index](https://willowinworld.com/languages.json): Machine-readable map of every localized site and AI guide.
- [Privacy policy](https://willowinworld.com/privacy.html): Website privacy information.
- [Legal notice](https://willowinworld.com/legal.html): Ownership, trademarks and website terms.

## Contact

- [Email WillowinWorld](mailto:contact@willowinworld.com): Press, publishing, development-build and business enquiries.
`;
}

export { siteRoot };
