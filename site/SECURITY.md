# WillowinWorlds Static Site Security

## Hard limits

This project is a static browser experience. Every HTML, CSS, JavaScript, and image
asset needed to render the page must be sent to the visitor's browser. It can be
viewed, saved, copied, or screen-captured by that visitor. Minification and source
obfuscation only add friction; they do not make a frontend secret.

Do not ship any real promo code, private key, admin token, API secret, unpublished
game build, or access-control rule in this repository. A real reward claim should
be issued by a server after the secret interaction is verified or redeemed.

The promo word hunt is a claim flow, not a code vault. It may reveal a claim
phrase and a client-generated claim ID for manual review, but real promo codes
must be issued privately by email or a server-side redemption system.

## Current site posture

- No external JavaScript, CSS, fonts, images, embeds, analytics, or CDNs.
- No backend form submission and no network connection from the page.
- DOM text created from JavaScript uses text nodes instead of HTML strings.
- Theme storage is validated before use.
- Outbound links to the studio's store and social profiles are plain `<a href>` navigation to hosts allow-listed in `tools/security-check.mjs`; nothing is loaded from them.
- Production is GitHub Pages, which does not send custom HTTP response headers. The strict meta CSP in every HTML page is the only policy layer this repository applies there.
- `_headers`, `_redirects` and everything in `deploy/` are not applied by GitHub Pages and are not published. They are kept only as ready-made configuration for a host that supports them.
- Header-only protections (`frame-ancestors` and clickjacking defense, which a meta CSP ignores, `X-Frame-Options`, `Permissions-Policy`) are therefore not in effect on GitHub Pages.

## CSP limits by design

- `frame-src`, `child-src`, `media-src`, `connect-src`, `font-src` and `worker-src` are `'none'`. Embedded players or iframes, audio/video, web fonts and any `fetch`/XHR/WebSocket call are blocked.
- `trusted-types 'none'` with `require-trusted-types-for 'script'` blocks HTML injection through DOM sinks.
- Allowing any of these needs a CSP change in every HTML page (home, press kit, policy, game and all localized pages), a review of the new origin, and an update of `tools/security-check.mjs`.

## Deployment checklist

1. Serve the site only over HTTPS.
2. Only when hosting somewhere that can send headers (not GitHub Pages): apply the
   security headers in `_headers` on a static host that supports that file, include
   `deploy/nginx-security.conf` in an HTTPS Nginx server block, or use
   `deploy/apache-security.htaccess` on an HTTPS Apache host with `mod_headers`.
3. Verify the live behavior with a browser network panel or a security-header scanner.
   On GitHub Pages only the meta CSP can be observed.
4. Keep hosting, DNS, repository, and domain registrar accounts behind MFA and least
   privilege access.
5. Deploy from a protected branch and review every future external script, iframe,
   analytics tag, form endpoint, and third-party asset before relaxing CSP.
6. Back up the project and keep host software patched if it is self-hosted.
7. Run `node tools/security-check.mjs` before deployment. It blocks common static
   regressions such as inline event handlers, external assets, network APIs, and
   token-shaped strings in client JavaScript.

Where `_headers` or the `deploy/` snippets are used, `Strict-Transport-Security` currently uses one year without `includeSubDomains`.
Add `includeSubDomains` or preload only after every subdomain is HTTPS-ready.
Optional preload snippets live in `deploy/hsts-preload-nginx.conf` and
`deploy/hsts-preload-apache.htaccess`; keep them disabled until that condition is
true.

## Asset folder migration

Legacy public asset folders still include spaces for compatibility with current
URLs. A future slug migration should follow `deploy/asset-folder-migration.md`
and ship redirects before any legacy folders are removed.

## Contact form release path

The current contact form intentionally opens a prepared email instead of sending
data from the browser. That keeps the static site simple and avoids exposing API
keys, form tokens, SMTP credentials, or bot-abusable endpoints in frontend code.

If a real hosted form is added later, put it behind a server-side endpoint with:

- server-side validation and output escaping;
- rate limiting per IP and per email address;
- spam protection that does not leak a private key to the browser;
- CSRF protection if cookies or authenticated sessions are introduced;
- structured logging without storing unnecessary personal data;
- a strict CORS allowlist for the production domain only.

Never enforce business rules only in frontend JavaScript. Anything that matters
for rewards, beta access, uploads, private material, or publisher contact should
be verified on the server.

## Press and asset policy

The public `press-kit.html` and game pages only link optimized preview assets.
Do not place layered source files, store submission packages, unpublished builds,
PSD/AI/Figma files, original Unity assets, or private publisher decks in `site/`.
Keep those materials in private storage and share them intentionally by email,
cloud link with access control, or publisher portal.
