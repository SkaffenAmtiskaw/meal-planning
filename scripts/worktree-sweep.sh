#!/bin/sh
# Removes each worktree under .claude/worktrees/ that's finished with, with its local branch and
# its slot's database, so nothing has to remember to clean up. The SessionStart hook runs it on
# every local session start. It leaves out the session's own worktree. A worktree is finished with
# in two cases:
# - Its PR has merged, and its HEAD is that PR's head commit, so a worktree with commits since the
#   merge is left alone. If the PR carries the notes-pending label, the worktree stays and the
#   script names the PR, because the PR's held notes work still needs doing (/tooling #<PR>).
# - It never got work of its own: its HEAD is already on origin/develop (origin/main for a hotfix/
#   branch), and it was made more than a day ago. One made for a session that edits only notes is
#   an example. No PR will ever merge from it, so the first case never removes it. Waiting a day
#   spares a worktree whose session is still working but hasn't changed anything yet.
# Either way, it's removed only if it's clean. To remove it, the script empties its database, then
# removes the worktree and deletes its branch with -D, since a squash merge leaves the branch's commits off
# develop. A merged one with uncommitted changes stays, and the script names it. One with no
# commits of its own and uncommitted changes is work in progress, so it stays without a word.
# Quiet when there's nothing to do. Everything it prints goes to stdout, where the SessionStart
# hook passes it to the session, and it always exits 0, so the session starts anyway.
# Usage: sh scripts/worktree-sweep.sh <the session's checkout folder>

[ "$CLAUDE_CODE_REMOTE" = "true" ] && exit 0

dir="${1:-.}"
common_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir) || exit 0
own=$(git -C "$dir" rev-parse --show-toplevel) || exit 0
main=$(dirname "$common_dir")

# Each candidate worktree as "<path><tab><HEAD><tab><branch>": under .claude/worktrees/, not the
# session's own, on a branch, and with its folder still there.
candidates=$(git -C "$main" worktree list --porcelain | awk -v own="$own" -v under="$main/.claude/worktrees/" '
  /^worktree / { path = substr($0, 10); head = ""; branch = "" }
  /^HEAD / { head = $2 }
  /^branch refs\/heads\// { branch = substr($0, 19) }
  /^$/ { if (index(path, under) == 1 && path != own && branch != "") print path "\t" head "\t" branch; path = "" }
  END { if (index(path, under) == 1 && path != own && branch != "") print path "\t" head "\t" branch }
' | while IFS="$(printf '\t')" read -r path head branch; do
  [ -d "$path" ] && printf '%s\t%s\t%s\n' "$path" "$head" "$branch"
done)
[ -n "$candidates" ] || exit 0

# The merged PRs, as "<number><tab><head branch><tab><head commit><tab><notes-pending?><tab><title>".
if ! merged=$(cd "$main" && gh pr list --state merged --limit 200 \
  --json number,title,headRefName,headRefOid,labels \
  --jq '.[] | [.number, .headRefName, .headRefOid, (any(.labels[]; .name == "notes-pending")), .title] | @tsv' 2>&1); then
  echo "worktree-sweep.sh: couldn't list the merged PRs with gh, so no merged worktree was removed: $(printf '%s' "$merged" | head -n 1)"
  exit 0
fi

tab=$(printf '\t')
printf '%s\n' "$candidates" | while IFS="$tab" read -r path head branch; do
  pr=$(printf '%s\n' "$merged" | awk -F '\t' -v b="$branch" -v h="$head" '$2 == b && $3 == h { print; exit }')
  if [ -n "$pr" ]; then
    number=$(printf '%s' "$pr" | cut -f 1)
    pending=$(printf '%s' "$pr" | cut -f 4)
    title=$(printf '%s' "$pr" | cut -f 5-)
    if [ "$pending" = "true" ]; then
      echo "worktree-sweep.sh: PR #$number ($title) merged with held notes work, so its worktree $path stays until /tooling #$number does that work."
      continue
    fi
    why="PR #$number ($title) merged"
  else
    case "$branch" in
      hotfix/*) base=origin/main ;;
      *) base=origin/develop ;;
    esac
    git -C "$main" merge-base --is-ancestor "$head" "$base" 2>/dev/null || continue
    # git writes the worktree's gitdir file when it makes the worktree, so its age is the worktree's.
    made="$(git -C "$path" rev-parse --path-format=absolute --git-dir 2>/dev/null)/gitdir"
    [ -n "$(find "$made" -mmin +1440 2>/dev/null)" ] || continue
    # Uncommitted changes here are work in progress, such as a first step not yet committed, so
    # the worktree stays without a word.
    [ -z "$(git -C "$path" status --porcelain)" ] || continue
    why="$branch has no commits of its own, and its worktree was made more than a day ago"
  fi

  if [ -n "$(git -C "$path" status --porcelain)" ]; then
    echo "worktree-sweep.sh: $why, but its worktree $path has uncommitted changes, so it stays. Commit them for a new PR, or throw them away and the next session start removes it."
    continue
  fi

  # A worktree with no PORT in its .env.local never took a slot, so it has no database to empty.
  emptied=""
  if grep -q '^PORT=' "$path/.env.local" 2>/dev/null; then
    if out=$(pnpm --dir "$path" --silent db:empty-worktree 2>&1); then
      emptied=" and its database emptied"
    else
      echo "worktree-sweep.sh: couldn't empty the database of $path, so it holds this worktree's data until the next worktree on its slot empties it:"
      echo "$out" | tail -n 20
    fi
  fi

  if ! out=$(git -C "$main" worktree remove "$path" 2>&1); then
    echo "worktree-sweep.sh: $why, but git couldn't remove its worktree $path:"
    echo "$out"
    continue
  fi
  if ! out=$(git -C "$main" branch -D "$branch" 2>&1); then
    echo "worktree-sweep.sh: removed the worktree $path, but git couldn't delete its branch $branch:"
    echo "$out"
    continue
  fi
  echo "worktree-sweep.sh: $why, so its worktree $path and its branch $branch were removed$emptied."
done
exit 0
