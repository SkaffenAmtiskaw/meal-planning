#!/bin/sh
# Lists every reference to a note and to its files, so /close, /tooling and
# /shape don't search for each link form by hand. Each hit is tagged with what
# can be told mechanically; whether a mention relies on the note's content is
# still the reader's call. Reports vault paths from the notes repo's root and
# other paths from the code repo's root. Changes nothing.
# Usage: sh scripts/note-refs.sh "<note name>"

code_repo=$(cd "$(dirname "$0")/.." && pwd) || exit 1
notes_repo=$(sh "$code_repo/scripts/notes-dir.sh") || exit 1
cd "$notes_repo" || exit 1
name="$1"
if [ -z "$name" ]; then
  echo "Usage: sh scripts/note-refs.sh \"<note name>\""
  exit 1
fi

matches=$(find . \( -name .git -o -name .obsidian \) -prune -o -type f -name "$name.md" -print | sed 's|^\./||')
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
echo "Note: $note"

# Its files: everything it embeds or links that isn't a note, found by name as
# Obsidian does, plus the rest of any assets folder those files sit in.
refs=$(grep -oE '\[\[[^]|#]+\.[A-Za-z0-9]+(\||#|\]\])|\]\([^)]+\.[A-Za-z0-9]+\)|src="[^"]+"' "$note" |
  sed -E 's/^\[\[//; s/(\||#|\]\])$//; s/^\]\(//; s/\)$//; s/^src="//; s/"$//' |
  sed 's/%20/ /g' | grep -vE '\.md$' | while IFS= read -r ref; do basename "$ref"; done | sort -u)
files=$(printf '%s\n' "$refs" | while IFS= read -r f; do
  [ -n "$f" ] && find . \( -name .git -o -name .obsidian \) -prune -o -type f -name "$f" -print | sed 's|^\./||'
done | sort -u)
folders=$(printf '%s\n' "$files" | while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in (assets/*/*|archive/assets/*/*) dirname "$f" ;; esac
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
# their key; a user's comment, a line that starts with a name tag or ends with a
# signature (as in user-comments.sh), gets an extra tag.
tag() {
  awk -v name="$name" -v roadmap="Roadmap.md" '
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
      plain = $0; gsub(/`[^`]*`/, "", plain)
      who = "[A-Z][a-z]+( [A-Z][a-z]+)?"
      if (plain ~ ("^[ \t]*([-*>][ \t]+)?(\\[[ xX]\\][ \t]+)?\\[" who "\\]") ||
        plain ~ ("[^ \t-][ \t]+(-|–|—)[ \t]*" who "[.]?[ \t]*$")) kind = kind ", user'"'"'s comment"
      text = $0; gsub(/^[ \t]+/, "", text)
      if (length(text) > 160) text = substr(text, 1, 157) "..."
      printf "%s:%d\t%s\t%s\n", FILENAME, FNR, kind, text
    }' "$@"
}

echo "In the vault (file:line, kind, text):"
vault=$(grep -rlF --exclude-dir=.obsidian --exclude-dir=.git -e "$name" . | sed 's|^\./||' | grep -vxF -- "$note")
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
    grep -rnIF --exclude-dir=.obsidian --exclude-dir=.git -e "$base" -e "$encoded" . | sed 's|^\./||' |
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
outside=$(cd "$code_repo" && grep -rnIF -e "$name" -e "$note" src test docs scripts .github .claude AGENTS.md CLAUDE.md 2>/dev/null |
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
  [ -f "archive/$l.md" ] && echo "archive/$l.md"
done)
linking=$(printf '%s\n' "$vault" | grep '^archive/[^/]*\.md$')
none=$(printf '%s\n%s\n' "$linked" "$linking" | grep . | sort -u | while IFS= read -r a; do
  kept=$(awk 'FNR == 1 && $0 != "---" { exit } FNR > 1 && $0 == "---" { exit }
    /^kept-for:/ { on = 1; v = $0; sub(/^kept-for:[ \t]*/, "", v); if (v != "" && v != "[]") n++; next }
    on && /^[ \t]*-/ { n++; next } on { on = 0 }
    END { print n + 0 }' "$a")
  [ "$kept" -eq 0 ] && echo "  $a"
done)
if [ -n "$none" ]; then printf '%s\n' "$none"; else echo "  none"; fi
