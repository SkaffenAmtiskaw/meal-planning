#!/bin/bash
# PreToolUse hook for skills that plan or change notes but never change code.
# Blocks file edits outside the notes repo, .scratch/ and Claude's memory
# directory. Extra directories to allow, relative to the checkout the session
# works in, can be passed as arguments, e.g. `notes-only-edits.sh docs`.

input=$(cat)
file_path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")
cwd=$(jq -r '.cwd // empty' <<<"$input")

if [[ "$file_path" == *"/../"* ]]; then
  echo "Blocked: path contains '..' ($file_path)." >&2
  exit 2
fi

# On failure, notes-dir.sh's error names the path it looked for, and exit 2
# passes it on to the session.
notes=$(sh "$(dirname "$0")/../../scripts/notes-dir.sh") || exit 2

# In an app worktree session, $CLAUDE_PROJECT_DIR is the main checkout, so the
# session's own checkout comes from its cwd.
checkout=$(git -C "${cwd:-$CLAUDE_PROJECT_DIR}" rev-parse --show-toplevel 2>/dev/null) || checkout=$CLAUDE_PROJECT_DIR

case "$file_path" in
  "$notes/"* | "$checkout/.scratch/"* | "$HOME/.claude/projects/"*)
    exit 0
    ;;
esac

for dir in "$@"; do
  if [[ "$file_path" == "$checkout/${dir%/}/"* ]]; then
    exit 0
  fi
done

allowed="the notes repo or .scratch/"
for dir in "$@"; do
  allowed="$allowed or ${dir%/}/"
done
echo "Blocked: this session can only edit files in $allowed (tried $file_path)." >&2
exit 2
