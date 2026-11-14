#!/bin/sh
# Says whether the release freeze lets this work go ahead, so every skill that
# changes code checks it the same way. A release is under way when the building
# goal's Goals line on the Roadmap says " · releasing", or a PR from develop
# into main is open, which covers the time between /ship-goal's close-out and
# the merge. While one is, only a story that the building goal's "# Release"
# section links may be built. A hotfix/ branch is never refused, since the
# freeze covers develop.
# Prints why, and exits 0 if the work may go ahead and 1 if it's refused. If it
# can't tell, such as when gh can't reach GitHub, it says so and exits 2.
# Usage: sh scripts/release-freeze.sh [story note name]
# Leave out the story for work that isn't a story, such as a /tooling change,
# which a release always refuses.

story="$1"

case "$(git branch --show-current)" in
  hotfix/*)
    echo "This is a hotfix branch, which the release freeze doesn't cover."
    exit 0
    ;;
esac

notes=$(sh "$(dirname "$0")/notes-dir.sh") || exit 2

goal_line=$(awk '
  /^# Goals/ { in_goals = 1; next }
  in_goals && /^#/ { exit }
  in_goals && /- building/ { print; exit }
' "$notes/Roadmap.md")
goal=$(printf '%s\n' "$goal_line" | sed -n 's/.*\[\[\([^]|#]*\).*/\1/p')

reason=""
case "$goal_line" in
  *"· releasing"*) reason="the building goal, $goal, is releasing" ;;
esac

if [ -z "$reason" ]; then
  # gh api, not gh pr list: a routine's cloud session reaches GitHub's REST API
  # but not the GraphQL API the gh pr commands use.
  if ! prs=$(gh api -X GET "repos/{owner}/{repo}/pulls" -f base=main -F head="{owner}:develop" -f state=open --jq '.[].html_url' 2>&1); then
    echo "release-freeze.sh: couldn't check GitHub for an open PR from develop into main, so it can't tell whether a release is under way:"
    echo "$prs"
    exit 2
  fi
  [ -n "$prs" ] && reason="the release PR from develop into main is open ($prs)"
fi

if [ -z "$reason" ]; then
  echo "No release is under way."
  exit 0
fi

if [ -n "$story" ] && [ -n "$goal" ] && [ -f "$notes/goals/$goal.md" ]; then
  linked=$(awk -v s="$story" '
    /^# Release/ { in_release = 1; next }
    in_release && /^# / { exit }
    in_release && (index($0, "[[" s "]]") || index($0, "[[" s "|") || index($0, "[[" s "#")) { print "yes"; exit }
  ' "$notes/goals/$goal.md")
  if [ "$linked" = "yes" ]; then
    echo "A release is under way ($reason), and $goal's Release section links $story, so it may be built."
    exit 0
  fi
fi

if [ -n "$story" ]; then
  echo "A release is under way ($reason), and $goal's Release section doesn't link $story, so it can't be built until the release PR merges into main."
else
  echo "A release is under way ($reason), so only the release's own work may change develop until the release PR merges into main."
fi
exit 1
