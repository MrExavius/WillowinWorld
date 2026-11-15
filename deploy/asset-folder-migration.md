# Asset Folder Migration Plan

Current legacy folders:

- `assets/Nature Seeds/`
- `assets/Candy Shop/`
- `assets/Paint Blasters/`
- `assets/Ball is God/`

Future target folders:

- `assets/nature-seeds/`
- `assets/candy-shop/`
- `assets/paint-blasters/`
- `assets/ball-is-god/`

Safe migration order:

1. Copy each legacy folder to its lowercase target folder.
2. Update HTML, CSS, JS, sitemap image URLs and structured data to the new paths.
3. Deploy with redirects from `asset-folder-redirects-nginx.conf` or `asset-folder-redirects-apache.htaccess`.
4. Verify live old URLs return `301` and new URLs return `200`.
5. Only then delete legacy folders in a later release.

Do not rename these folders in one local-only step. Direct `file://` previews and hosts without redirects would break existing asset URLs.
