#!/bin/sh
# Prints one top-level section of notes/Note Conventions.md, so a skill can
# inject just the part it needs with !`sh scripts/note-section.sh "<Heading>"`.
# Usage: sh scripts/note-section.sh "Next Step by Note State"

cd "$(dirname "$0")/.." || exit 1
file="notes/Note Conventions.md"
heading="$1"

section=$(awk -v h="# $heading" '
  $0 == h { found = 1; print; next }
  found && /^# / { exit }
  found { print }
' "$file")

if [ -z "$section" ]; then
  echo "Section \"$heading\" not found in $file. Read the full note instead."
  exit 0
fi
printf '%s\n' "$section"
