#!/bin/bash
# PreToolUse hook registered by the /implement skill.
# Asks Sarah before an edit touches lint, type, coverage or git hook config,
# or adds a comment that switches off a lint, type or coverage check.

input=$(cat)
file_path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")

ask() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: $reason}}'
  exit 0
}

case "$(basename "$file_path")" in
  biome.json | biome.jsonc | vitest.config.* | tsconfig*.json | lefthook*.yml | lefthook*.yaml)
    ask "Project config ($file_path). Only allowed if Sarah explicitly asked for this config change."
    ;;
esac

new_text=$(jq -r '[.tool_input.new_string, .tool_input.content, (.tool_input.edits // [] | .[].new_string)] | map(select(. != null)) | join("\n")' <<<"$input")
old_text=$(jq -r '[.tool_input.old_string, (.tool_input.edits // [] | .[].old_string)] | map(select(. != null)) | join("\n")' <<<"$input")

# Write has no old text in its input, so compare against the file as it is now.
if [[ -z "$old_text" && -f "$file_path" ]]; then
  old_text=$(cat "$file_path")
fi

pattern='biome-ignore|v8 ignore|c8 ignore|istanbul ignore|@ts-ignore|@ts-expect-error|@ts-nocheck'
count() { grep -Eo "$pattern" <<<"$1" | wc -l; }

if (($(count "$new_text") > $(count "$old_text"))); then
  ask "Adds a comment that switches off a lint, type or coverage check ($file_path). Only allowed if Sarah explicitly asked for it."
fi

exit 0
