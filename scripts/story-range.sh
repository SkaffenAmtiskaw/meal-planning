#!/bin/sh
# Proposes a story's commit range for /final-review, so it doesn't work the
# range out from git log by hand. Commit messages don't name the story, so the
# range starts at the first commit that marked one of the note's steps
# "**Status:** ✅ Complete", or at the commit given as the second argument, and
# runs to HEAD, plus any uncommitted changes. Lists the files changed in it
# outside notes/, split into those the note's text names and the rest, and the
# commits just before the range, in case one of them built part of the story.
# Changes nothing.
# Usage: sh scripts/story-range.sh "<note name>" [first commit of the story]

cd "$(dirname "$0")/.." || exit 1
name="$1"
if [ -z "$name" ]; then
  echo 'Usage: sh scripts/story-range.sh "<note name>" [first commit of the story]'
  exit 1
fi

matches=$(find notes -type f -name "$name.md" ! -path 'notes/templates/*')
count=$(printf '%s' "$matches" | grep -c .)
if [ "$count" -eq 0 ]; then
  echo "No note named \"$name\" in notes/."
  exit 1
fi
if [ "$count" -gt 1 ]; then
  echo "More than one note named \"$name\":"
  printf '%s\n' "$matches"
  exit 1
fi
note=$matches

if [ -n "$2" ]; then
  first=$(git rev-parse --verify --quiet "$2^{commit}") || { echo "Not a commit: $2"; exit 1; }
else
  # --follow doesn't work with --reverse, so the oldest match is the last line.
  first=$(git log --follow -S'**Status:** ✅ Complete' --format=%H -- "$note" | tail -1)
  if [ -z "$first" ]; then
    echo "No commit marks a step of $note ✅ Complete."
    exit 1
  fi
fi
base=$(git rev-parse --verify --quiet "$first^") || { echo "$first has no parent commit."; exit 1; }

tmp=$(mktemp -d) || exit 1
trap 'rm -rf "$tmp"' EXIT

show() { git log -1 --date=short --format='%h %ad %s' "$1" | cut -c1-120; }
named() { grep -qF -- "$1" "$note"; }

{ git diff --name-only HEAD -- . ':(exclude)notes'
  git ls-files --others --exclude-standard -- . ':(exclude)notes'; } | sort -u > "$tmp/uncommitted"
{ git diff --name-only "$base" HEAD -- . ':(exclude)notes'; cat "$tmp/uncommitted"; } | sort -u > "$tmp/files"

: > "$tmp/named"
: > "$tmp/other"
while IFS= read -r f; do
  line="  $f"
  grep -qxF -- "$f" "$tmp/uncommitted" && line="$line (uncommitted)"
  if named "$f"; then echo "$line" >> "$tmp/named"; else echo "$line" >> "$tmp/other"; fi
done < "$tmp/files"

echo "Note: $note"
echo "Range: $(git rev-parse --short "$base")..HEAD"
echo "  First commit: $(show "$first")"
echo "  Last commit:  $(show HEAD)"
if [ -s "$tmp/uncommitted" ]; then
  echo "Uncommitted changes outside notes/: yes, included"
else
  echo "Uncommitted changes outside notes/: none"
fi
echo
echo "Files the note names:"
if [ -s "$tmp/named" ]; then cat "$tmp/named"; else echo "  (none)"; fi
echo
echo "Other files, possibly from other stories:"
if [ -s "$tmp/other" ]; then cat "$tmp/other"; else echo "  (none)"; fi
echo
echo "Commits just before the range (* changes a file the note names):"
git log -5 --format=%H "$base" | while IFS= read -r c; do
  mark=" "
  git show --name-only --format= "$c" -- . ':(exclude)notes' > "$tmp/commit"
  while IFS= read -r f; do
    named "$f" && { mark="*"; break; }
  done < "$tmp/commit"
  echo "  $mark $(show "$c")"
done
