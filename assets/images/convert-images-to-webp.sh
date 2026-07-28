#!/usr/bin/env bash
# ============================================================
# Convert the remaining local raster images (logos in
# /assets/images/) to WebP. Run this ON THE SERVER, in the site's
# assets/images directory — the actual image files weren't part of
# this upload, so this couldn't be done automatically here.
#
# After running, update index.html's <img> tags for these files to
# <picture> elements, e.g.:
#
#   <picture>
#     <source srcset="/assets/images/hummingbot.webp" type="image/webp">
#     <img src="/assets/images/hummingbot.png" alt="Hummingbot logo"
#          width="120" height="120" loading="lazy" decoding="async">
#   </picture>
#
# Only do that swap AFTER confirming the .webp file exists at that
# path (a <picture> source pointing at a missing file will not fall
# back gracefully in browsers that support WebP).
# ============================================================
set -euo pipefail

command -v cwebp >/dev/null 2>&1 || {
  echo "cwebp not found. Install with: sudo apt-get install -y webp"
  exit 1
}

cd "$(dirname "$0")"

for f in *.png *.jpg *.jpeg; do
  [ -e "$f" ] || continue
  out="${f%.*}.webp"
  echo "Converting $f -> $out"
  cwebp -q 82 "$f" -o "$out"
done

echo "Done. Review file sizes with: ls -la *.webp"
