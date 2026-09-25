#!/bin/bash
# PreToolUse hook registered by the /assess skill.
# Blocks Edit/Write outside notes/, .opencode/scratch/ and Claude's memory directory.

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

echo "Blocked: this session can only edit files in notes/ or .opencode/scratch/ (tried $file_path)." >&2
exit 2
