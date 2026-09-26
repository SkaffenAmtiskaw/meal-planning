#!/bin/bash
# PreToolUse hook registered by the planning skills (/assess, /plan-steps, /check-drift).
# Blocks Edit/Write outside notes/, .opencode/scratch/ and Claude's memory directory.
# Extra project-relative directories to allow can be passed as arguments,
# e.g. `notes-only-edits.sh .opencode/docs` for /check-drift.

file_path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')

if [[ "$file_path" == *"/../"* ]]; then
  echo "Blocked: path contains '..' ($file_path)." >&2
  exit 2
fi

case "$file_path" in
  "$CLAUDE_PROJECT_DIR/notes/"* | "$CLAUDE_PROJECT_DIR/.opencode/scratch/"* | "$HOME/.claude/projects/"*)
    exit 0
    ;;
esac

for dir in "$@"; do
  if [[ "$file_path" == "$CLAUDE_PROJECT_DIR/${dir%/}/"* ]]; then
    exit 0
  fi
done

allowed="notes/ or .opencode/scratch/"
for dir in "$@"; do
  allowed="$allowed or ${dir%/}/"
done
echo "Blocked: this session can only edit files in $allowed (tried $file_path)." >&2
exit 2
