# WillowinWorlds Quality Checks

Local checks:

- `node site/tools/quality-check.mjs`
- `node site/tools/link-check.mjs`
- `node site/tools/visual-check.mjs`
- `node site/tools/css-coverage-audit.mjs`
- `node site/tools/seo-check.mjs`
- `node site/tools/build-minified.mjs`
- `node site/tools/update-sitemap-lastmod.mjs`

Deployment model:

- Production (GitHub Pages, branch `35`) publishes the source `site/` folder minus internal files (`tools/`, `deploy/`, `dist/`, `reports/`, `_headers`, `_redirects`, `QUALITY_CHECKS.md`). `site/dist` is a build check only and is never deployed. `.github/workflows/pages.yml` runs `node site/tools/quality-check.mjs` before every deploy.
- `_headers`, `_redirects` and `deploy/*` are not applied by GitHub Pages; only the meta CSP in each page is. See `SECURITY.md`.
- `node site/tools/security-check.mjs` requires exactly one future `Expires:` in `.well-known/security.txt`, so it fails once that date passes. Renew it (RFC 9116: less than a year ahead) before then.
- `node site/tools/seo-check.mjs` fails if any public text file under `site/` (except `dist/` and `reports/`) contains the legacy singular domain, the misspelled studio name or a mailbox at the studio domain. Use the contact email from `tools/localization-config.mjs`.

Devlog publishing:

- Add the newest item inside the game's `#devlog .update-list` with `data-devlog-entry`, `data-published="YYYY-MM-DD"`, and a matching `<time datetime="YYYY-MM-DD">`.
- Run `node site/tools/sync-devlogs.mjs` to refresh the homepage fallback, `rss.xml`, `llms.txt`, game `dateModified` values and sitemap devlog dates.
- Production builds derive the homepage, RSS, machine-readable studio guide, game structured-data dates and sitemap dates directly from the newest dated game-page entries. `node site/tools/sync-devlogs.mjs --check` fails CI when checked-in output is stale.

SEO publishing:

- Keep every indexable page title, description, canonical URL and social preview unique and factual.
- Do not add prices, ratings, reviews, release dates or availability claims unless they are public and verifiable.
- `node site/tools/seo-check.mjs` validates the metadata contract, JSON-LD, sitemap coverage, devlog freshness links, AI-search crawler access and generated `llms.txt` guide.
- Keep `llms.txt` factual and concise. It is generated output: edit game source pages or the profiles in `tools/devlog-data.mjs`, then run the sync command instead of editing the file by hand.

External checks after deployment:

- Lighthouse desktop and mobile.
- WebPageTest with a mobile connection profile.
- WAVE accessibility scan.
- Keyboard-only and screen reader smoke test.
- SecurityHeaders.com and Google CSP Evaluator.
- OWASP ZAP baseline scan on staging or production.
- Google Rich Results Test for home, press kit and every game page.
- Search Console sitemap submission, canonical inspection and indexing review.
- Verify public pages are reachable by legitimate OAI-SearchBot, PerplexityBot and Claude-SearchBot requests at the CDN/WAF layer; robots.txt permission alone cannot override an upstream bot block.
- Real Android and iOS device checks.
