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
- A strict meta CSP protects direct `index.html` usage where server headers do not exist.
- `_headers` and `deploy/nginx-security.conf` provide the stronger HTTP-header layer for hosting.

## Deployment checklist

1. Serve the site only over HTTPS.
2. Apply the security headers in `_headers` on a static host that supports that file,
   include `deploy/nginx-security.conf` in an HTTPS Nginx server block, or use
   `deploy/apache-security.htaccess` on an HTTPS Apache host with `mod_headers`.
3. Verify the live headers with a browser network panel or a security-header scanner.
4. Keep hosting, DNS, repository, and domain registrar accounts behind MFA and least
   privilege access.
5. Deploy from a protected branch and review every future external script, iframe,
   analytics tag, form endpoint, and third-party asset before relaxing CSP.
6. Back up the project and keep host software patched if it is self-hosted.
7. Run `node tools/security-check.mjs` before deployment. It blocks common static
   regressions such as inline event handlers, external assets, network APIs, and
   token-shaped strings in client JavaScript.

`Strict-Transport-Security` currently uses one year without `includeSubDomains`.
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
