#!/bin/sh
# Lists a note's user comments, the lines that start with a name tag
# ("[Sarah] ...") or end with a signature ("... - Sarah"), each marked new or
# old against the note's `confirmed` date, so /check-drift doesn't read git
# blame by hand. A line is new if it was committed after `confirmed` or isn't
# committed yet. Any name counts, and text in backticks is ignored, so whether
# a line really is a user's comment is still the reader's call. Changes nothing.
# Usage: sh scripts/user-comments.sh "<note name>"

cd "$(dirname "$0")/.." || exit 1
name="$1"
if [ -z "$name" ]; then
  echo "Usage: sh scripts/user-comments.sh \"<note name>\""
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

confirmed=$(awk 'FNR == 1 && $0 != "---" { exit } FNR > 1 && $0 == "---" { exit }
  /^confirmed:/ { sub(/^confirmed:[ \t]*/, ""); print; exit }' "$note")
if ! printf '%s' "$confirmed" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "$note has no confirmed date in its frontmatter."
  exit 1
fi
echo "Note: $note (confirmed $confirmed)"
echo "User comments (new or old, line, date committed, text):"

# Each blame line is "<commit> (<author> <date> <line number>) <text>", with a
# commit of zeros for an uncommitted line. A note git doesn't track yet is
# uncommitted throughout.
if git ls-files --error-unmatch -- "$note" > /dev/null 2>&1; then
  git blame --date=short -- "$note"
else
  awk '{ printf "00000000 (Not Committed Yet 0000-00-00 %d) %s\n", NR, $0 }' "$note"
fi | awk -v confirmed="$confirmed" '
  {
    d = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]"
    if (!match($0, d " +" NR "\\) ")) next
    when = substr($0, RSTART, 10)
    text = substr($0, RSTART + RLENGTH)
    commit = $1; sub(/^\^/, "", commit)
  }
  NR == 1 && text == "---" { fm = 1; next }
  fm { if (text == "---") fm = 0; next }
  {
    plain = text; gsub(/`[^`]*`/, "", plain)
    who = "[A-Z][a-z]+( [A-Z][a-z]+)?"
    tag = plain ~ ("^[ \t]*([-*>][ \t]+)?(\\[[ xX]\\][ \t]+)?\\[" who "\\]")
    sig = plain ~ ("[^ \t-][ \t]+(-|–|—)[ \t]*" who "[.]?[ \t]*$")
    if (!tag && !sig) next
    if (commit ~ /^0+$/) { when = "uncommitted"; age = "new" }
    else age = (when > confirmed) ? "new" : "old"
    gsub(/^[ \t]+/, "", text)
    if (length(text) > 160) text = substr(text, 1, 157) "..."
    printf "%s\t%d\t%s\t%s\n", age, NR, when, text
    found = 1
  }
  END { if (!found) print "  none" }'
