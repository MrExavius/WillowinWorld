# WillowinWorld Quality Checks

Local checks:

- `node site/tools/quality-check.mjs`
- `node site/tools/link-check.mjs`
- `node site/tools/visual-check.mjs`
- `node site/tools/css-coverage-audit.mjs`
- `node site/tools/build-minified.mjs`
- `node site/tools/update-sitemap-lastmod.mjs`

Devlog publishing:

- Add the newest item inside the game's `#devlog .update-list` with `data-devlog-entry`, `data-published="YYYY-MM-DD"`, and a matching `<time datetime="YYYY-MM-DD">`.
- Run `node site/tools/sync-devlogs.mjs` to refresh the homepage fallback and `rss.xml` for local previews.
- Production builds also derive the homepage and RSS directly from the newest dated game-page entries. `node site/tools/sync-devlogs.mjs --check` fails CI when the checked-in fallback is stale.

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
