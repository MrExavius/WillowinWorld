# AI Change Log

## 2026-11-10 — Align public SEO identity with willowinworlds.com

- Scope: Migrate public website URLs and contact addresses inside `site/` from the singular domain to `willowinworlds.com`, preserving unrelated asset filenames and making no deployment or Git publishing changes.
- Changed: Updated canonical, Open Graph, JSON-LD, Sitemap, robots, RSS, language index, localized pages and AI guides; changed the public contact address to `contact@willowinworlds.com`; centralized origin/email constants; regenerated 41 translated locales; refreshed the CSP hash; added a legacy-domain regression scan to the SEO contract.
- Compatibility/config: No dependency changes. The new contact domain currently has no MX record, so inbound email remains unverified until mail DNS/service setup is completed.
- Validation: `node site/tools/quality-check.mjs` — PASS; `node site/tools/css-coverage-audit.mjs` — PASS; `node site/tools/update-sitemap-lastmod.mjs --check` — PASS; `node site/tools/build-minified.mjs` — PASS; `node site/tools/visual-check.mjs` — PASS for 10 pages at desktop/mobile sizes; `git diff --check` — PASS; built-output scan for the legacy URL/email domain — PASS (0 matches).
- Risks/follow-up: Deploy before evaluating public canonical/index changes; verify the property and submit the plural-domain Sitemap in Google Search Console. Search reprocessing can take time. Configure MX before relying on the new contact address.
- Rollback: Revert this entry's site changes, restore the previous origin/email constants and CSP hash, then rerun the localization and devlog generators plus the full quality check.
