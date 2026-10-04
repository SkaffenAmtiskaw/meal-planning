#!/bin/sh
# Lists every reference to a note and to its files, so /close, /tooling and
# /shape don't search for each link form by hand. Each hit is tagged with what
# can be told mechanically; whether a mention relies on the note's content is
# still the reader's call. Changes nothing.
# Usage: sh scripts/note-refs.sh "<note name>"

cd "$(dirname "$0")/.." || exit 1
name="$1"
if [ -z "$name" ]; then
  echo "Usage: sh scripts/note-refs.sh \"<note name>\""
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
echo "Note: $note"

# Its files: everything it embeds or links that isn't a note, found by name as
# Obsidian does, plus the rest of any assets folder those files sit in.
refs=$(grep -oE '\[\[[^]|#]+\.[A-Za-z0-9]+(\||#|\]\])|\]\([^)]+\.[A-Za-z0-9]+\)|src="[^"]+"' "$note" |
  sed -E 's/^\[\[//; s/(\||#|\]\])$//; s/^\]\(//; s/\)$//; s/^src="//; s/"$//' |
  sed 's/%20/ /g' | grep -vE '\.md$' | while IFS= read -r ref; do basename "$ref"; done | sort -u)
files=$(printf '%s\n' "$refs" | while IFS= read -r f; do
  [ -n "$f" ] && find notes -type f -name "$f" ! -path 'notes/templates/*'
done | sort -u)
folders=$(printf '%s\n' "$files" | while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in (notes/assets/*/*|notes/archive/assets/*/*) dirname "$f" ;; esac
done | sort -u)
files=$( (printf '%s\n' "$files"; printf '%s\n' "$folders" | while IFS= read -r d; do
  [ -n "$d" ] && find "$d" -type f ! -name '.*'
done) | grep . | sort -u)
if [ -n "$files" ]; then
  echo "Its files:"
  printf '%s\n' "$files" | sed 's/^/  /'
else
  echo "Its files: none"
fi
echo

# Tags one file's lines that mention the name. Frontmatter lists are tagged by
# their key; Sarah's comments get an extra tag.
tag() {
  awk -v name="$name" -v roadmap="notes/Roadmap.md" '
    FNR == 1 { fm = ($0 == "---"); key = ""; if (fm) next }
    fm && $0 == "---" { fm = 0; next }
    fm && match($0, /^[A-Za-z_-]+:/) { key = substr($0, 1, RLENGTH - 1) }
    !index($0, name) { next }
    {
      link = index($0, "[[" name "]]") || index($0, "[[" name "|") || index($0, "[[" name "#")
      embed = index($0, "![[" name "]]") || index($0, "![[" name "#")
      item = $0; sub(/^[ \t]*([-*]|[0-9]+\.)[ \t]+/, "", item)
      own = (index(item, "[[" name "]]") == 1 || index(item, "[[" name "|") == 1)
      if (fm && key == "blocked-by" && link) kind = "blocked-by entry"
      else if (fm && key == "kept-for" && link) kind = "kept-for entry"
      else if (fm) kind = "frontmatter (" key ")"
      else if (index($0, "**Blocked by [[" name "]]:**")) kind = "Blocked by marker"
      else if (FILENAME == roadmap && own) kind = "its own Roadmap line"
      else if (FILENAME == roadmap && link) kind = "Roadmap line"
      else if (embed) kind = "embed"
      else if (link) kind = "link"
      else kind = "plain text"
      if ($0 ~ /\[Sarah\]/ || $0 ~ /- Sarah[ .]*$/) kind = kind ", Sarah'"'"'s comment"
      text = $0; gsub(/^[ \t]+/, "", text)
      if (length(text) > 160) text = substr(text, 1, 157) "..."
      printf "%s:%d\t%s\t%s\n", FILENAME, FNR, kind, text
    }' "$@"
}

echo "In the vault (file:line, kind, text):"
vault=$(grep -rlF --exclude-dir=.obsidian --exclude-dir=templates -e "$name" notes | grep -vxF -- "$note")
if [ -n "$vault" ]; then
  printf '%s\n' "$vault" | while IFS= read -r f; do tag "$f"; done
else
  echo "  none"
fi
echo

echo "References to its files (file:line, file, text):"
hits=""
if [ -n "$files" ]; then
  hits=$(printf '%s\n' "$files" | while IFS= read -r f; do
    base=$(basename "$f")
    encoded=$(printf '%s' "$base" | sed 's/ /%20/g')
    grep -rnIF --exclude-dir=.obsidian --exclude-dir=templates -e "$base" -e "$encoded" notes |
      grep -vF -- "$note:" | while IFS= read -r hit; do
        where=${hit%%:*}; rest=${hit#*:}; line=${rest%%:*}; text=${rest#*:}
        [ "$where" = "$f" ] && continue
        text=$(printf '%s' "$text" | sed -E 's/^[[:space:]]+//' | cut -c1-160)
        printf '%s:%s\t%s\t%s\n' "$where" "$line" "$base" "$text"
      done
  done)
fi
if [ -n "$hits" ]; then printf '%s\n' "$hits"; else echo "  none"; fi
echo

echo "Outside the vault (file:line, text):"
outside=$(grep -rnIF -e "$name" -e "$note" src test docs .claude AGENTS.md CLAUDE.md 2>/dev/null |
  while IFS= read -r hit; do
    where=${hit%%:*}; rest=${hit#*:}; line=${rest%%:*}; text=${rest#*:}
    text=$(printf '%s' "$text" | sed -E 's/^[[:space:]]+//' | cut -c1-160)
    printf '%s:%s\t%s\n' "$where" "$line" "$text"
  done)
if [ -n "$outside" ]; then printf '%s\n' "$outside"; else echo "  none"; fi
echo

# Archived notes linked either way whose kept-for is empty or missing.
echo "Archived notes linked either way, with no kept-for:"
linked=$(grep -oE '\[\[[^]|#]+' "$note" | sed 's/^\[\[//' | sort -u | while IFS= read -r l; do
  [ -f "notes/archive/$l.md" ] && echo "notes/archive/$l.md"
done)
linking=$(printf '%s\n' "$vault" | grep '^notes/archive/[^/]*\.md$')
none=$(printf '%s\n%s\n' "$linked" "$linking" | grep . | sort -u | while IFS= read -r a; do
  kept=$(awk 'FNR == 1 && $0 != "---" { exit } FNR > 1 && $0 == "---" { exit }
    /^kept-for:/ { on = 1; v = $0; sub(/^kept-for:[ \t]*/, "", v); if (v != "" && v != "[]") n++; next }
    on && /^[ \t]*-/ { n++; next } on { on = 0 }
    END { print n + 0 }' "$a")
  [ "$kept" -eq 0 ] && echo "  $a"
done)
if [ -n "$none" ]; then printf '%s\n' "$none"; else echo "  none"; fi
