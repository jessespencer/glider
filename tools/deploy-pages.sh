#!/bin/bash
# Builds the game and publishes it to the gh-pages branch, which GitHub Pages serves.
# The original game's assets go out only in that built branch; main never holds them.
set -euo pipefail

cd "$(dirname "$0")/.."
if [ ! -f public/assets/house.json ]; then
  echo "public/assets is missing. Run npm run import-assets first." >&2
  exit 1
fi

npm run build
touch dist/.nojekyll

site=$(mktemp -d)
trap 'git worktree remove --force "$site" >/dev/null 2>&1 || true; rm -rf "$site"' EXIT

if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch -q origin gh-pages
  git worktree add -q "$site" origin/gh-pages
else
  git worktree add -q --detach "$site"
  git -C "$site" checkout -q --orphan gh-pages
fi

git -C "$site" rm -rqf --ignore-unmatch .
cp -R dist/. "$site"/
git -C "$site" add -A
git -C "$site" commit -q -m "Deploy $(git rev-parse --short HEAD)" || echo "Nothing changed to deploy."
git -C "$site" push -q origin HEAD:gh-pages
echo "Deployed $(git rev-parse --short HEAD) to gh-pages."
