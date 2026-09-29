#!/bin/sh
# Checks the notes vault for the rules in AGENTS.md ("Editing notes") and the
# Roadmap's "How this file works" that can be checked mechanically.
# - Per note: only notes changed since the last commit (git status), or the
#   notes named as arguments. Older notes are brought up to spec when they're
#   worked on, so unchanged ones aren't checked.
# - Whole vault: broken links, blocked-by entries, Roadmap status embeds, and
#   Now and Next markers.
# Changes nothing. Exits 1 if it reports anything.
# Usage: sh scripts/vault-lint.sh [note name or path ...]

cd "$(dirname "$0")/.." || exit 1
roadmap="notes/Roadmap.md"
tmp=$(mktemp -d) || exit 1
trap 'rm -rf "$tmp"' EXIT

find notes -name '*.md' ! -path 'notes/templates/*' ! -path 'notes/.obsidian/*' | sort > "$tmp/notes"
find notes -type f ! -name '*.md' ! -path 'notes/.obsidian/*' | while IFS= read -r f; do basename "$f"; done | sort -u > "$tmp/files"
while IFS= read -r n; do basename "$n" .md; done < "$tmp/notes" | sort -u > "$tmp/names"

# Notes to check one by one.
if [ $# -gt 0 ]; then
  for arg in "$@"; do
    case "$arg" in
      (*.md) echo "$arg" ;;
      (*) grep -F "/$arg.md" "$tmp/notes" | grep -E "/$(printf '%s' "$arg" | sed 's/[][\.*^$()+?{}|/]/\\&/g')\.md$" ;;
    esac
  done > "$tmp/changed"
else
  git status --porcelain --untracked-files=all -- notes | cut -c4- | sed 's/^"//; s/"$//; s/.* -> //' |
    grep -E '\.md$' | grep -vE '^notes/(templates/|Roadmap\.md$|Note Conventions\.md$)' |
    while IFS= read -r f; do [ -f "$f" ] && echo "$f"; done > "$tmp/changed"
fi

report="$tmp/report"
: > "$report"
add() { printf '%s\n' "$1" >> "$report"; }

# Each Roadmap list line whose first link is a note: "name<TAB>line number<TAB>section<TAB>heading<TAB>line".
awk '
  /^# / { section = substr($0, 3); heading = ""; next }
  /^## / { heading = substr($0, 4); next }
  {
    item = $0
    if (!sub(/^[ \t]*([-*]|[0-9]+\.)[ \t]+\[\[/, "", item)) next
    name = item; sub(/[]|#\\].*/, "", name)
    printf "%s\t%d\t%s\t%s\t%s\n", name, NR, section, heading, $0
  }' "$roadmap" > "$tmp/lines"

# --- Per note ---
while IFS= read -r note; do
  [ -f "$note" ] || { add "$note: not found"; continue; }
  name=$(basename "$note" .md)
  case "$note" in
    (notes/goals/*) ;;
    (*)
      grep -q ' \^status$' "$note" || add "$note: no ^status line under Where It Stands"
      grep -q '^# Where It Stands' "$note" || add "$note: no # Where It Stands section"
      ;;
  esac
  line=$(awk -F '\t' -v n="$name" '$1 == n' "$tmp/lines" | head -1)
  case "$note" in
    (notes/features/*|notes/archive/*)
      if [ -n "$line" ] && ! printf '%s' "$line" | grep -qF "![[$name#^status]]"; then
        add "$note: its Roadmap line ($roadmap:$(printf '%s' "$line" | cut -f2)) doesn't embed ![[$name#^status]]"
      fi
      ;;
  esac
  if grep -q '^## What Belongs Here' "$note" && [ -n "$line" ]; then
    items=$(awk 'FNR == 1 && $0 == "---" { fm = 1; next } fm && $0 == "---" { fm = 0; next } !fm' "$note" |
      grep -oE '🎯 \[\[[^]|]+' | sed 's/^🎯 \[\[//' | sort -u)
    onLine=$(printf '%s' "$line" | cut -f5 | grep -oE '🎯 \[\[[^]|]+' | sed 's/^🎯 \[\[//' | sort -u)
    at="$roadmap:$(printf '%s' "$line" | cut -f2)"
    for g in $(printf '%s\n' "$items" | tr ' ' '\001'); do
      g=$(printf '%s' "$g" | tr '\001' ' ')
      printf '%s\n' "$onLine" | grep -qxF -- "$g" || add "$note: an item links 🎯 [[$g]], but its Roadmap line ($at) doesn't"
    done
    for g in $(printf '%s\n' "$onLine" | tr ' ' '\001'); do
      g=$(printf '%s' "$g" | tr '\001' ' ')
      printf '%s\n' "$items" | grep -qxF -- "$g" || add "$note: its Roadmap line ($at) links 🎯 [[$g]], but no item does"
    done
    section=$(printf '%s' "$line" | cut -f3); heading=$(printf '%s' "$line" | cut -f4)
    if [ "$section" = "Later" ] && [ -n "$heading" ] && [ "$heading" != "Unaffiliated" ]; then
      add "$note: its Roadmap line ($at) sits under \"$heading\", but a collecting note's line goes in Unaffiliated"
    fi
  fi
  comments=$(grep -c '%%' "$note")
  if [ "$comments" -gt 0 ]; then
    add "$note: $comments line(s) with %% template comments. Remove them if this session worked on the note, not if it only edited it in passing"
  fi
done < "$tmp/changed"

# --- Whole vault ---
# Broken links, skipping code spans, fenced blocks and %% comments, where links
# are examples.
grep -vE '^notes/(Note Conventions\.md)$' "$tmp/notes" | tr '\n' '\0' |
  xargs -0 awk -v names="$tmp/names" -v files="$tmp/files" '
    BEGIN {
      while ((getline n < names) > 0) note[n] = 1
      while ((getline f < files) > 0) file[f] = 1
    }
    FNR == 1 { fence = 0; comment = 0 }
    /^[ \t]*```/ { fence = !fence; next }
    fence { next }
    {
      line = $0; kept = ""
      # Keep only the text outside %% comments, which can span lines.
      while ((i = index(line, "%%")) > 0) {
        if (!comment) kept = kept substr(line, 1, i - 1)
        comment = !comment; line = substr(line, i + 2)
      }
      if (!comment) kept = kept line
      line = kept; gsub(/`[^`]*`/, "", line)
      while (match(line, /\[\[[^]]+\]\]/)) {
        t = substr(line, RSTART + 2, RLENGTH - 4); line = substr(line, RSTART + RLENGTH)
        sub(/[|#].*/, "", t); sub(/\\$/, "", t); sub(/.*\//, "", t)
        if (t == "") continue
        if (t ~ /\.md$/) sub(/\.md$/, "", t)
        if (t ~ /\.[A-Za-z0-9]+$/ && !(t in note)) { if (!(t in file)) printf "%s:%d: link to a missing file: %s\n", FILENAME, FNR, t }
        else if (!(t in note)) printf "%s:%d: link to a missing note: [[%s]]\n", FILENAME, FNR, t
      }
    }' >> "$report"

# blocked-by entries must point at open stories.
grep '^notes/features/' "$tmp/notes" | while IFS= read -r n; do
  awk 'FNR == 1 && $0 != "---" { exit } FNR > 1 && $0 == "---" { exit }
    /^[A-Za-z_-]+:/ { on = ($0 ~ /^blocked-by:/) } on' "$n" | grep -oE '\[\[[^]|#]+' | sed 's/^\[\[//' |
    while IFS= read -r t; do
      target=$(grep -F "/$t.md" "$tmp/notes" | while IFS= read -r c; do [ "$(basename "$c" .md)" = "$t" ] && echo "$c"; done | head -1)
      case "$target" in
        ("") ;; # a missing note is already reported as a broken link
        (notes/features/*)
          grep -qE '^status: (done|dropped)' "$target" && add "$n: blocked-by [[$t]], which is $(grep -oE '^status: (done|dropped)' "$target" | cut -c9-)" ;;
        (*) add "$n: blocked-by [[$t]], which is closed ($target)" ;;
      esac
    done
done

# Roadmap status embeds must point at a note with a ^status line.
grep -oE '!\[\[[^]#]+#\^status\]\]' "$roadmap" | sed -E 's/^!\[\[//; s/#\^status\]\]$//' | sort -u |
  while IFS= read -r t; do
    target=$(grep -F "/$t.md" "$tmp/notes" | while IFS= read -r c; do [ "$(basename "$c" .md)" = "$t" ] && echo "$c"; done | head -1)
    [ -n "$target" ] && ! grep -q ' \^status$' "$target" && add "$roadmap: embeds [[$t#^status]], but $target has no ^status line"
  done

# Every Now and Next line needs a 🎯 link to an active goal, 🚨 or 📌.
awk '
  /^# / { section = substr($0, 3); next }
  section == "Goals" && /- active/ { g = $0; sub(/.*\[\[/, "", g); sub(/[]|].*/, "", g); active[g] = 1; next }
  (section == "Now" || section == "Next") && /^[ \t]*([-*]|[0-9]+\.)[ \t]+/ {
    if (index($0, "🚨") || index($0, "📌")) next
    rest = $0; ok = 0
    while (match(rest, /🎯 \[\[[^]|]+/)) {
      g = substr(rest, RSTART, RLENGTH); sub(/^🎯 \[\[/, "", g)
      if (g in active) ok = 1
      rest = substr(rest, RSTART + RLENGTH)
    }
    if (!ok) printf "%s:%d: a %s line with no 🎯 link to an active goal, 🚨 or 📌\n", FILENAME, NR, section
  }' "$roadmap" >> "$report"

checked=$(grep -c . "$tmp/changed")
if [ -s "$report" ]; then
  echo "Checked $checked changed note(s) and the whole vault. Found:"
  sed 's/^/- /' "$report"
  exit 1
fi
echo "Checked $checked changed note(s) and the whole vault. No issues."
