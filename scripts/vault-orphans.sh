#!/bin/sh
# Lists every file in notes/ that isn't a note and that nothing references, so
# /close and /tooling don't search for each one by hand. Obsidian finds files by
# name, so a reference is any file in notes/ that contains the filename (or its
# %20-encoded form): an embed, a link, plain text, or a prototype loading it.
# References from files that are themselves unreferenced don't count, so a
# script loaded only by an orphaned prototype is listed too.
# Skips notes/templates/ and notes/.obsidian/. Changes nothing.
# Usage: sh scripts/vault-orphans.sh

cd "$(dirname "$0")/.." || exit 1

candidates=$(find notes -type f ! -name '*.md' ! -name '.*' \
  ! -path 'notes/templates/*' ! -path 'notes/.obsidian/*' | sort)

# Grows until stable: each pass drops the references coming from files already
# found to be orphans.
orphans=""
while :; do
  found=""
  while IFS= read -r file; do
    [ -n "$file" ] || continue
    name=$(basename "$file")
    encoded=$(printf '%s' "$name" | sed 's/ /%20/g')
    referenced=$(grep -rlIF --exclude-dir=.obsidian -e "$name" -e "$encoded" notes |
      while IFS= read -r ref; do
        [ "$ref" = "$file" ] && continue
        printf '%s\n' "$orphans" | grep -qxF -- "$ref" && continue
        echo "$ref"
      done)
    [ -z "$referenced" ] && found="$found$file
"
  done <<EOF
$candidates
EOF
  [ "$found" = "$orphans" ] && break
  orphans=$found
done

if [ -z "$orphans" ]; then
  echo "No unreferenced files in notes/."
  exit 0
fi

# Git state decides how each one may be deleted (AGENTS.md, "Git and files").
echo "Unreferenced files (path, then git state):"
printf '%s' "$orphans" | while IFS= read -r file; do
  state=$(git status --porcelain -- "$file" | cut -c1-2)
  case "$state" in
    "") state="committed, unchanged" ;;
    "??") state="untracked" ;;
    *) state="uncommitted changes" ;;
  esac
  printf '%s\t%s\n' "$file" "$state"
done

# A folder whose files are all listed above is left empty once they're deleted.
printf '%s' "$orphans" | while IFS= read -r file; do dirname "$file"; done | sort -u |
  while IFS= read -r dir; do
    [ "$dir" = "notes" ] && continue
    left=$(find "$dir" -type f ! -name '.*' | while IFS= read -r f; do
      printf '%s\n' "$orphans" | grep -qxF -- "$f" || echo "$f"
    done)
    [ -z "$left" ] && echo "Empty once these are deleted: $dir/"
  done
