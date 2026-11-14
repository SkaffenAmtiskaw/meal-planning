#!/bin/sh
# Keeps develop current after PRs merge on GitHub. Fetches origin in the folder
# it's given; in the main checkout, on develop with no uncommitted changes, it
# also fast-forwards develop. Quiet on success. On failure it prints what went
# wrong to stdout, where the SessionStart hook passes it to the session, and
# still exits 0, so the session starts anyway.
# Usage: sh scripts/sync-develop.sh <checkout folder>

[ "$CLAUDE_CODE_REMOTE" = "true" ] && exit 0

dir="${1:-.}"

if ! out=$(git -C "$dir" fetch --quiet origin 2>&1); then
  echo "sync-develop.sh: git fetch origin failed in $dir:"
  echo "$out"
  exit 0
fi

git_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-dir)
common_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir)
[ "$git_dir" = "$common_dir" ] || exit 0
[ "$(git -C "$dir" branch --show-current)" = "develop" ] || exit 0
[ -z "$(git -C "$dir" status --porcelain --untracked-files=no)" ] || exit 0

if ! out=$(git -C "$dir" merge --ff-only --quiet origin/develop 2>&1); then
  echo "sync-develop.sh: couldn't fast-forward develop to origin/develop in $dir:"
  echo "$out"
fi
exit 0
