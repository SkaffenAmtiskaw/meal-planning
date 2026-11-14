#!/bin/sh
# Proposes a story's commit range for /final-review, so it doesn't work the
# range out from git log by hand. The range is the story branch's own: from
# where it meets its base (origin/main on a hotfix/ branch, origin/develop on
# any other) to HEAD, plus any uncommitted changes, so merges of the base into
# the branch add nothing to it. Lists the files changed in it, split into those
# the note's text names and the rest, since a merge's conflict resolution can
# touch files the note doesn't name. Changes nothing.
# Usage: sh scripts/story-range.sh "<note name>"

cd "$(dirname "$0")/.." || exit 1
notes_repo=$(sh scripts/notes-dir.sh) || exit 1
name="$1"
if [ -z "$name" ]; then
  echo 'Usage: sh scripts/story-range.sh "<note name>"'
  exit 1
fi

matches=$(cd "$notes_repo" && find . \( -name .git -o -name .obsidian \) -prune -o -type f -name "$name.md" -print | sed 's|^\./||')
count=$(printf '%s' "$matches" | grep -c .)
if [ "$count" -eq 0 ]; then
  echo "No note named \"$name\" in the notes repo."
  exit 1
fi
if [ "$count" -gt 1 ]; then
  echo "More than one note named \"$name\":"
  printf '%s\n' "$matches"
  exit 1
fi
note=$matches

branch=$(git symbolic-ref --quiet --short HEAD) || { echo "HEAD isn't on a branch."; exit 1; }
case "$branch" in
  hotfix/*) target=main ;;
  *) target=develop ;;
esac
base=$(git merge-base "origin/$target" HEAD) || { echo "$branch has no commit in common with origin/$target."; exit 1; }

tmp=$(mktemp -d) || exit 1
trap 'rm -rf "$tmp"' EXIT

show() { git log -1 --date=short --format='%h %ad %s' "$1" | cut -c1-120; }
named() { grep -qF -- "$1" "$notes_repo/$note"; }

{ git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u > "$tmp/uncommitted"
{ git diff --name-only "$base" HEAD; cat "$tmp/uncommitted"; } | sort -u > "$tmp/files"

: > "$tmp/named"
: > "$tmp/other"
while IFS= read -r f; do
  line="  $f"
  grep -qxF -- "$f" "$tmp/uncommitted" && line="$line (uncommitted)"
  if named "$f"; then echo "$line" >> "$tmp/named"; else echo "$line" >> "$tmp/other"; fi
done < "$tmp/files"

# The branch's own commits, oldest first, leaving out what merges of the base
# brought in.
first=$(git rev-list --reverse --first-parent "$base..HEAD" | head -1)

echo "Note: $note"
echo "Branch: $branch, from origin/$target"
echo "Range: $(git rev-parse --short "$base")..HEAD"
if [ -n "$first" ]; then
  echo "  First commit: $(show "$first")"
  echo "  Last commit:  $(show HEAD)"
else
  echo "  No commits on the branch yet."
fi
if [ -s "$tmp/uncommitted" ]; then
  echo "Uncommitted changes: yes, included"
else
  echo "Uncommitted changes: none"
fi
echo
echo "Files the note names:"
if [ -s "$tmp/named" ]; then cat "$tmp/named"; else echo "  (none)"; fi
echo
echo "Other files:"
if [ -s "$tmp/other" ]; then cat "$tmp/other"; else echo "  (none)"; fi
