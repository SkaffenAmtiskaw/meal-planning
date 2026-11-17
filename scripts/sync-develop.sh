#!/bin/sh
# Keeps the main checkout's develop and its dev data current after PRs merge on
# GitHub. Fetches origin in the folder it's given. In the main checkout, on
# develop with no uncommitted changes, it also fast-forwards develop and runs
# each release task in scripts/release-tasks/ on the `test` database, in
# filename order, so the dev data has the shape develop's code reads (see
# docs/release_tasks.md, "The Dev Database"). A task changes only data still in
# the old shape, so after the first run, later runs change nothing. Quiet on
# success. On failure it prints what went wrong to stdout,
# where the SessionStart hook passes it to the session, and still exits 0, so
# the session starts anyway.
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

top=$(git -C "$dir" rev-parse --show-toplevel)
set -- "$top"/scripts/release-tasks/*.ts
[ -e "$1" ] || exit 0

db_url=$(sed -n 's/^DB_URL=//p' "$top/.env.local" 2>/dev/null | tail -n 1)
if [ -z "$db_url" ]; then
  echo "sync-develop.sh: no DB_URL in $top/.env.local, so the release tasks didn't run on the test database."
  exit 0
fi

for task in "$@"; do
  if ! out=$(cd "$top" && node "$task" --to "$db_url" --db test 2>&1); then
    echo "sync-develop.sh: release task $(basename "$task") failed on the test database, so the later tasks didn't run:"
    echo "$out"
    exit 0
  fi
done
exit 0
