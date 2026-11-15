# WillowinWorlds Quality Checks

Local checks:

- `node tools/quality-check.mjs`
- `node tools/link-check.mjs`
- `node tools/visual-check.mjs`
- `node tools/css-coverage-audit.mjs`
- `node tools/seo-check.mjs`
- `node tools/build-minified.mjs`
- `node tools/update-sitemap-lastmod.mjs`

Deployment model:

- Production (GitHub Pages, branch `35`) publishes the source `site/` folder minus `dist/`, `_headers` and `_redirects`. `site/` holds only published files; tooling lives in `tools/`, hosting snippets in `deploy/`, documentation in `docs/`, and generated output in `reports/` and `dist/`, all at the repo root. `dist` is a build check only and is never deployed. `.github/workflows/pages.yml` runs `node tools/quality-check.mjs` before every deploy.
- `_headers`, `_redirects` and `deploy/*` are not applied by GitHub Pages; only the meta CSP in each page is. See `SECURITY.md`.
- `node tools/security-check.mjs` requires exactly one future `Expires:` in `.well-known/security.txt`, so it fails once that date passes. Renew it (RFC 9116: less than a year ahead) before then.
- `node tools/seo-check.mjs` fails if any public text file under `site/` (except `dist/` and `reports/`) contains the legacy singular domain, the misspelled studio name or a mailbox at the studio domain. Use the contact email from `tools/localization-config.mjs`.

Devlog publishing:

- Add the newest item inside the game's `#devlog .update-list` with `data-devlog-entry`, `data-published="YYYY-MM-DD"`, and a matching `<time datetime="YYYY-MM-DD">`.
- Run `node tools/sync-devlogs.mjs` to refresh the homepage fallback, `rss.xml`, `llms.txt`, game `dateModified` values and sitemap devlog dates.
- Production builds derive the homepage, RSS, machine-readable studio guide, game structured-data dates and sitemap dates directly from the newest dated game-page entries. `node tools/sync-devlogs.mjs --check` fails CI when checked-in output is stale.

Lab game pages:

- Prototype game pages (`games/<slug>.html`) are listed in `labPages` in `tools/localization-config.mjs` (file, path, kind `game-upcoming`, priority, changefreq, plus name, genre and status) and are part of `localizedPages`. The English page is the hand-written source; `localize-site.mjs` generates `<lang>/games/<slug>.html` for every locale with the hreflang cluster, language picker, share links and runtime i18n like the flagship game pages.
- Game names (and the partner studio name) are protected terms and stay untranslated. A game title split over several elements is marked `translate="no"` on each text-only span, so the generator leaves it alone.
- Every localized home and press kit links the lab page of its own language (`games/<slug>.html`, no `hreflang` attribute). The `In development` and `Genre` labels and the lab intro line of `llms.txt` (`labIntro` in the config) are translated runtime strings.
- `sitemap.xml` keeps one hand-written English `<url>` per page (with `lastmod`) before the generated `localized-pages` block; the generator adds the hreflang cluster to it and the localized entries after it. Update `lastmod` when a page changes.
- `seo-check.mjs` applies the metadata, canonical, robots, hreflang and VideoGame JSON-LD contract to every language, checks that each home shows a matching "In development" card (English also genre and status), that no home or press-kit link overrides the page language, and that `llms.txt` and every localized guide list the page. `security-check.mjs` scans the English pages like other pages and `link-check.mjs` walks every HTML file. `css/upcoming-game.css` and `css/home-lab.css` are in the security-check and build lists.
- Adding a page: add it to `labPages`, add the card to `index.html#in-development`, add the English sitemap entry, run `node tools/sync-devlogs.mjs`, then `node tools/localize-site.mjs` (new strings need translations first).

SEO publishing:

- Keep every indexable page title, description, canonical URL and social preview unique and factual.
- Do not add prices, ratings, reviews, release dates or availability claims unless they are public and verifiable.
- `node tools/seo-check.mjs` validates the metadata contract, JSON-LD, sitemap coverage, devlog freshness links, AI-search crawler access and generated `llms.txt` guide.
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
