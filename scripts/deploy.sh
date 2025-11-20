#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
RELEASE_DIR="$ROOT_DIR/deploy/tea-time-release"

rm -rf "$DIST_DIR" "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

npm run build

cp -R "$DIST_DIR"/* "$RELEASE_DIR"/
cp "$ROOT_DIR/.htaccess" "$RELEASE_DIR/.htaccess"
cp -R "$ROOT_DIR/api" "$RELEASE_DIR/api"

cat > "$RELEASE_DIR/DEPLOYMENT.md" <<'DOC'
# Tea Time Deployment

1. Upload the contents of this directory to your PHP hosting root for https://tea-time.shanemichel.net.
2. Ensure PHP 8.2+ with SQLite and `mod_rewrite` are enabled.
3. The included `.htaccess` keeps `/api` routes on PHP while sending other requests to the SPA `index.html`.
4. The `public` assets already include `robots.txt`, `sitemap.xml`, and Open Graph images. Regenerate with `npm run generate:seo` before rebuilding if routes change.
DOC

echo "Release bundle created at $RELEASE_DIR"
