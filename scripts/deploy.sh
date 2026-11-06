#!/bin/sh
# Builds the app and publishes dist/ to the gh-pages branch, which GitHub Pages serves.
set -e
remote=$(git remote get-url origin)
npm test
npm run build
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -q --force "$remote" gh-pages
rm -rf .git
echo "Published. GitHub Pages may take a minute to update."
