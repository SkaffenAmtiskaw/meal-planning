#!/bin/bash
# PreToolUse hook: approves `git -C <worktree> merge --ff-only <sha>` when a
# session fast-forwards a story branch checked out in another worktree of this
# repo to the session's own HEAD. Any other command gets no decision, so it goes
# through the usual permission checks.

input=$(cat)
command=$(jq -r '.tool_input.command // empty' <<<"$input")
cwd=$(jq -r '.cwd // empty' <<<"$input")

# The whole command must be the merge, so nothing else rides on the approval.
if [[ "$command" =~ ^git\ -C\ \"([^\"\$\`\\]+)\"\ merge\ --ff-only\ ([0-9a-f]{7,40})$ ]] ||
  [[ "$command" =~ ^git\ -C\ \'([^\']+)\'\ merge\ --ff-only\ ([0-9a-f]{7,40})$ ]] ||
  [[ "$command" =~ ^git\ -C\ ([^\ \"\'\$\`\\]+)\ merge\ --ff-only\ ([0-9a-f]{7,40})$ ]]; then
  target=${BASH_REMATCH[1]}
  sha=${BASH_REMATCH[2]}
else
  exit 0
fi

own="${cwd:-$CLAUDE_PROJECT_DIR}"
common() { git -C "$1" rev-parse --path-format=absolute --git-common-dir 2>/dev/null; }

# The target is a different worktree of the same repo.
own_common=$(common "$own") || exit 0
[[ "$(common "$target")" == "$own_common" ]] || exit 0
[[ "$(git -C "$target" rev-parse --show-toplevel 2>/dev/null)" != "$(git -C "$own" rev-parse --show-toplevel)" ]] || exit 0

# It has a story branch checked out.
branch=$(git -C "$target" symbolic-ref --short -q HEAD) || exit 0
[[ "$branch" == feature/* ]] || exit 0

# The sha is the session's own HEAD.
[[ "$(git -C "$own" rev-parse --verify -q "$sha^{commit}")" == "$(git -C "$own" rev-parse HEAD)" ]] || exit 0

jq -n --arg reason "Fast-forwards story branch $branch to this session's HEAD." \
  '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "allow", permissionDecisionReason: $reason}}'
exit 0
