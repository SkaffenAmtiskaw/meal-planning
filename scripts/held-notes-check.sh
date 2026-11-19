#!/bin/sh
# Names each merged PR that still carries the notes-pending label, so the session can offer a
# session that runs /tooling #<PR> to do its held notes work. The SessionStart hook runs it on
# every local session start.
# Quiet when there's nothing to do. Everything it prints goes to stdout, where the SessionStart
# hook passes it to the session, and it always exits 0, so the session starts anyway.
# Usage: sh scripts/held-notes-check.sh <the session's checkout folder>

[ "$CLAUDE_CODE_REMOTE" = "true" ] && exit 0

dir="${1:-.}"
if ! pending=$(cd "$dir" && gh pr list --state merged --label notes-pending --limit 50 \
  --json number,title --jq '.[] | "\(.number)\t\(.title)"' 2>&1); then
  echo "held-notes-check.sh: couldn't list the merged PRs with gh, so any held notes work went unchecked: $(printf '%s' "$pending" | head -n 1)"
  exit 0
fi

printf '%s\n' "$pending" | while IFS="$(printf '\t')" read -r number title; do
  [ -n "$number" ] || continue
  echo "held-notes-check.sh: PR #$number ($title) merged with held notes work, which /tooling #$number does."
done
exit 0
