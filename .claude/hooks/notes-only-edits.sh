#!/bin/bash
# PreToolUse hook for skills that plan or change notes but never change code.
# Blocks file edits outside the notes repo, .scratch/ and Claude's memory
# directory.

input=$(cat)
file_path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")

if [[ "$file_path" == *"/../"* ]]; then
  echo "Blocked: path contains '..' ($file_path)." >&2
  exit 2
fi

# On failure, notes-dir.sh's error names the path it looked for, and exit 2
# passes it on to the session.
notes=$(sh "$(dirname "$0")/../../scripts/notes-dir.sh") || exit 2

case "$file_path" in
  "$notes/"* | "$HOME/.claude/projects/"*)
    exit 0
    ;;
esac

# The session's shell may sit in the notes repo or any other folder, so the
# session's own checkout can't be found from its cwd. Any checkout of this
# repo, the main one or a worktree, may have its .scratch/ written.
while IFS= read -r line; do
  if [[ "$line" == "worktree "* && "$file_path" == "${line#worktree }/.scratch/"* ]]; then
    exit 0
  fi
done < <(git -C "$(dirname "$0")" worktree list --porcelain)

echo "Blocked: this session can only edit files in the notes repo or .scratch/ (tried $file_path)." >&2
exit 2
