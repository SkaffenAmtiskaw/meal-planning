#!/bin/sh
# Lists the commits after a date that touch src/, test/ or docs/, each with
# the files it changed, then the uncommitted changes there, so /plan-steps can
# judge whether the code has moved on since a note's `confirmed` date without
# running git by hand. Changes nothing.
# Usage: sh scripts/commits-since.sh <YYYY-MM-DD>

cd "$(dirname "$0")/.." || exit 1
since="$1"
if ! printf '%s' "$since" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "Usage: sh scripts/commits-since.sh <YYYY-MM-DD>"
  exit 1
fi

# A commit made on the date itself counts as before it, so the log starts at
# the end of that day. Every file line starts with one of the three folders,
# so any other line is a commit; long subjects are cut to keep the list short.
echo "Commits after $since that touch src/, test/ or docs/ (hash, date, subject, then its files):"
git log --since="$since 23:59:59" --date=short --format='%h %cd %s' --name-only -- src test docs |
  awk '
    /^$/ { next }
    /^(src|test|docs)\// { print "  " $0; next }
    {
      if (length($0) > 160) $0 = substr($0, 1, 157) "..."
      print
      found = 1
    }
    END { if (!found) print "  none" }'

echo
echo "Uncommitted changes in src/, test/ or docs/ (git status --short):"
changes=$(git status --short -- src test docs)
if [ -z "$changes" ]; then
  echo "  none"
else
  printf '%s\n' "$changes" | sed 's/^/  /'
fi
