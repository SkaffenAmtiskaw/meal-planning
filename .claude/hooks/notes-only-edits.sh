#!/bin/bash
# PreToolUse hook for skills that plan or change notes but never change code.
# Blocks file edits outside notes/, .scratch/ and Claude's memory directory.
# Extra project-relative directories to allow can be passed as arguments,
# e.g. `notes-only-edits.sh docs`.

file_path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')

if [[ "$file_path" == *"/../"* ]]; then
  echo "Blocked: path contains '..' ($file_path)." >&2
  exit 2
fi

case "$file_path" in
  "$CLAUDE_PROJECT_DIR/notes/"* | "$CLAUDE_PROJECT_DIR/.scratch/"* | "$HOME/.claude/projects/"*)
    exit 0
    ;;
esac

for dir in "$@"; do
  if [[ "$file_path" == "$CLAUDE_PROJECT_DIR/${dir%/}/"* ]]; then
    exit 0
  fi
done

allowed="notes/ or .scratch/"
for dir in "$@"; do
  allowed="$allowed or ${dir%/}/"
done
echo "Blocked: this session can only edit files in $allowed (tried $file_path)." >&2
exit 2
