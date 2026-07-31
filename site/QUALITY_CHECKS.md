# WillowinWorld Quality Checks

Local checks:

- `node site/tools/quality-check.mjs`
- `node site/tools/link-check.mjs`
- `node site/tools/visual-check.mjs`
- `node site/tools/css-coverage-audit.mjs`
- `node site/tools/seo-check.mjs`
- `node site/tools/build-minified.mjs`
- `node site/tools/update-sitemap-lastmod.mjs`

Devlog publishing:

- Add the newest item inside the game's `#devlog .update-list` with `data-devlog-entry`, `data-published="YYYY-MM-DD"`, and a matching `<time datetime="YYYY-MM-DD">`.
- Run `node site/tools/sync-devlogs.mjs` to refresh the homepage fallback, `rss.xml`, game `dateModified` values and sitemap devlog dates.
- Production builds derive the homepage, RSS, game structured-data dates and sitemap dates directly from the newest dated game-page entries. `node site/tools/sync-devlogs.mjs --check` fails CI when checked-in output is stale.

SEO publishing:

- Keep every indexable page title, description, canonical URL and social preview unique and factual.
- Do not add prices, ratings, reviews, release dates or availability claims unless they are public and verifiable.
- `node site/tools/seo-check.mjs` validates the metadata contract, JSON-LD, sitemap coverage and devlog freshness links.

External checks after deployment:

- Lighthouse desktop and mobile.
- WebPageTest with a mobile connection profile.
- WAVE accessibility scan.
- Keyboard-only and screen reader smoke test.
- SecurityHeaders.com and Google CSP Evaluator.
- OWASP ZAP baseline scan on staging or production.
- Google Rich Results Test for home, press kit and every game page.
- Search Console sitemap submission, canonical inspection and indexing review.
- Real Android and iOS device checks.
