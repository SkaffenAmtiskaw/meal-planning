#!/bin/sh
# Makes a worktree buildable. In a worktree, it copies the main checkout's
# .env.local if the worktree has none, trusts its mise.toml, then runs
# pnpm install --frozen-lockfile, which also reinstalls lefthook's hook.
# In the main checkout it does nothing. Quiet on success. On failure it prints
# what went wrong to stdout, where the SessionStart hook passes it to the
# session, and still exits 0, so the session starts anyway.
# Usage: sh scripts/worktree-setup.sh <checkout folder>

[ "$CLAUDE_CODE_REMOTE" = "true" ] && exit 0

dir="${1:-.}"
git_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-dir) || exit 0
common_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir) || exit 0
[ "$git_dir" = "$common_dir" ] && exit 0

top=$(git -C "$dir" rev-parse --show-toplevel)
main=$(dirname "$common_dir")

if [ ! -f "$top/.env.local" ] && [ -f "$main/.env.local" ]; then
  cp "$main/.env.local" "$top/.env.local" ||
    echo "worktree-setup.sh: couldn't copy $main/.env.local into $top"
fi

if ! out=$(mise trust --quiet "$top/mise.toml" 2>&1); then
  echo "worktree-setup.sh: mise trust failed in $top:"
  echo "$out"
fi

if ! out=$(cd "$top" && pnpm install --frozen-lockfile 2>&1); then
  echo "worktree-setup.sh: pnpm install --frozen-lockfile failed in $top, so this worktree has no node_modules and commits skip lefthook's checks. Run pnpm install once the cause is fixed:"
  echo "$out" | tail -n 20
fi
exit 0
