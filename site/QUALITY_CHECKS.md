# WillowinWorld Quality Checks

Local checks:

- `node site/tools/quality-check.mjs`
- `node site/tools/css-coverage-audit.mjs`
- `node site/tools/build-minified.mjs`
- `node site/tools/update-sitemap-lastmod.mjs`

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
