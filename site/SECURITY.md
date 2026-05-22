# WillowinWorld Static Site Security

## Hard limits

This project is a static browser experience. Every HTML, CSS, JavaScript, and image
asset needed to render the page must be sent to the visitor's browser. It can be
viewed, saved, copied, or screen-captured by that visitor. Minification and source
obfuscation only add friction; they do not make a frontend secret.

Do not ship any real promo code, private key, admin token, API secret, unpublished
game build, or access-control rule in this repository. A real reward claim should
be issued by a server after the secret interaction is verified or redeemed.

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
