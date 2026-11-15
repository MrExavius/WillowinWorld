# AI Change Log

## 2026-11-15 - Keep only published files in site/

- Scope: Owner-approved repository layout cleanup on branch `35`. Public URLs and published files are unchanged.
- Changed: `site/tools/` -> `tools/` (translation memory now `tools/locales/`), `site/deploy/` -> `deploy/`, `site/QUALITY_CHECKS.md`, `FIXES-1-TECH.md`, `FIXES-2-CONTENT-SEO-SOCIAL.md`, `PRODUCT.md` -> `docs/`. Tools resolve the site as `../site/`; reports go to `reports/`, the minified build to `dist/` (both ignored). Old test artifacts `output/playwright/` and `.playwright-cli/` are untracked (kept on disk) and ignored. Workflows run `node tools/...`; `pages.yml` still publishes a copy of `site/`.
- Compatibility/config: Commands change from `node site/tools/<x>.mjs` to `node tools/<x>.mjs`. Earlier entries in this file keep their original paths.
- Validation: `node tools/quality-check.mjs` - PASS; `node tools/localize-site.mjs`, `sync-devlogs.mjs`, `update-sitemap-lastmod.mjs --check` then `git diff -- site` - no content change (byte-identical output); `build-minified.mjs`, `css-coverage-audit.mjs`, `visual-check.mjs` - PASS; local simulation of the `pages.yml` publish step - artifact has index.html, `.well-known/security.txt`, 41 locales, no tooling.
- Risks/follow-up: Ignored leftovers `site/dist/` and `site/reports/` still exist locally (not in a clean checkout); `link-check.mjs`/`seo-check.mjs` still skip them. The forbidden-string scan in `seo-check.mjs` now covers `site/` only.
- Rollback: `git revert` of this commit.

## 2026-11-15 - Localize the 8 lab game pages and apply SEO audit fixes

- Scope: Branch `35`, uncommitted on top of deployed commit `b3f7a19`. Owner asked to localize the 8 lab pages (blastblast, vacuum-shot, burger-stack, sandwich-stack, scooter-mechanic-simulator, alien-flying, lyamur, stack-tower) into all 41 locales and to fix what the Antigravity SEO audits found. No commit, push or external account changes.
- Changed:
  - Localization: `site/tools/localization-config.mjs` replaces `englishOnlyPages` with `labPages` inside `localizedPages` (41 locales x 17 pages); `site/tools/localize-site.mjs` renders lab pages like flagship pages (hreflang, language picker, localized sitemap/llms.txt, localized home and press-kit lab links), protects game names, skips `translate="no"` text elements, adds `rel="nofollow"` to share links, and is importable (`main()` runs unless `import.meta.main === false`). `seo-check.mjs` now checks lab pages in all 42 languages and that every same-origin JSON-LD URL exists (fixes the 328 broken `/<lang>/games/<lab>.html` ItemList URLs). 516 new strings per locale added to `site/tools/locales/*.json`.
  - SEO (English sources): image loading priority (preload/fetchpriority on the real LCP element, lazy on hidden and below-the-fold images) on index, nature-seed, candy-shop, ball-is-god, burger-stack, 404; shorter lab titles/descriptions; `dateModified` in lab JSON-LD; `rel="me"` links to the itch.io, Game Jolt and indiexpo profiles; PNG logo card in the press kit. Earlier the same day: Antigravity SEO phase 2 (Nature Seed `VideoGame`+`WebApplication`, breadcrumbs and WebPage JSON-LD, `max-image-preview:large`, distinct lab H2s, robots.txt hygiene, modal headings as `div role="heading"`), homepage CSP hash updated.
- Compatibility/config: No new dependencies. CI uses Node 22 (generator runs because `import.meta.main` is undefined there); `.agy-work/dump-missing.mjs` needs Node 24.2+ locally. Locale pages are generated: never hand-edit `site/<lang>/`.
- Validation: `node site/tools/quality-check.mjs` - PASS (715 public pages, 42 languages, security PASS); `.agy-work/smoke.mjs` (16 English pages at 1280 and 390) - PASS 32/32; localized lab smoke (de, fi, ru, ar, ja; 8 pages; 390 and 1280; status, overflow, clipped text, console) - PASS except a false positive on an RTL button shine; mobile LCP (Brave, 4x CPU, 150 ms RTT): nature-seed 4340 -> 2136 ms, index 2292 -> 2040 ms, burger-stack 1980 -> 1552 ms; screenshot diff of protected scenes - 0 px.
- Risks/follow-up: Lab translations are Haiku 5.5 low-effort output validated only by the generator rules (no native review). In RTL locales the lab hero mini-scenes are mirrored and "BlastBlast!" can render as "!BlastBlast" (same as flagship pages). Not done: CSS bundling (P0-2), index.html -> "/" links, new OG images, burger-stack dark-theme preload (+48 ms desktop), press-kit text still says "WebP" in two places. Owner actions from `.agy-work/seo-argon-offpage.md` (store pages, profiles, Search Console) remain open.
- Rollback: `git checkout -- site` and `git clean -fd site` restore the deployed `b3f7a19` state (removes all generated lab locale pages).

## 2026-11-10 — Route public contact mail to Gmail

- Scope: Replace the website contact destination with `willowinworlds@gmail.com` inside branch `35`; no account, DNS, Git publishing or deployment changes were authorized.
- Changed: Updated contact links, form-generated drafts, JSON-LD, `security.txt`, localization sources and all 41 generated locales; refreshed the JSON-LD CSP hash.
- Compatibility/config: No dependency or DNS changes. The contact form still opens the visitor's email application through `mailto:` rather than sending from a website backend.
- Validation: `node site/tools/quality-check.mjs` — PASS; site scan for `contact@willowinworlds.com` — PASS (0 matches); new address found in 2,131 published/source locations including `security.txt`.
- Risks/follow-up: Gmail account delivery was not tested by sending a real message. The public site changes require a separate commit/push and Pages deployment.
- Rollback: Restore the previous contact constant and content strings, regenerate locales, restore the prior CSP hash, then rerun the quality check.

## 2026-11-10 — Align public SEO identity with willowinworlds.com

- Scope: Migrate public website URLs and contact addresses inside `site/` from the singular domain to `willowinworlds.com`, preserving unrelated asset filenames and making no deployment or Git publishing changes.
- Changed: Updated canonical, Open Graph, JSON-LD, Sitemap, robots, RSS, language index, localized pages and AI guides; changed the public contact address to `contact@willowinworlds.com`; centralized origin/email constants; regenerated 41 translated locales; refreshed the CSP hash; added a legacy-domain regression scan to the SEO contract.
- Compatibility/config: No dependency changes. The new contact domain currently has no MX record, so inbound email remains unverified until mail DNS/service setup is completed.
- Validation: `node site/tools/quality-check.mjs` — PASS; `node site/tools/css-coverage-audit.mjs` — PASS; `node site/tools/update-sitemap-lastmod.mjs --check` — PASS; `node site/tools/build-minified.mjs` — PASS; `node site/tools/visual-check.mjs` — PASS for 10 pages at desktop/mobile sizes; `git diff --check` — PASS; built-output scan for the legacy URL/email domain — PASS (0 matches).
- Risks/follow-up: Deploy before evaluating public canonical/index changes; verify the property and submit the plural-domain Sitemap in Google Search Console. Search reprocessing can take time. Configure MX before relying on the new contact address.
- Rollback: Revert this entry's site changes, restore the previous origin/email constants and CSP hash, then rerun the localization and devlog generators plus the full quality check.
