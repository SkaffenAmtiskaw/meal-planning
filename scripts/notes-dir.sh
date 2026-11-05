#!/bin/sh
# Prints the notes repo's absolute path, the one place everything finds it: the
# meal-planning-notes folder beside the main checkout. Works from the main
# checkout, from any worktree and in a routine, where the notes clone sits
# beside the code clone. If the folder isn't there, it names the path it looked
# for and exits non-zero, so a caller stops rather than working on nothing.
# Usage: sh scripts/notes-dir.sh

common=$(git -C "$(dirname "$0")" rev-parse --path-format=absolute --git-common-dir) || exit 1
notes="$(dirname "$(dirname "$common")")/meal-planning-notes"
if [ ! -d "$notes" ]; then
  echo "notes-dir.sh: the notes repo isn't at $notes" >&2
  exit 1
fi
printf '%s\n' "$notes"
