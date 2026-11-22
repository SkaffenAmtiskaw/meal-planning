#!/bin/bash
# PreToolUse and PostToolUse hook: asks the user before an edit touches lint,
# type, coverage or git hook config, or adds a comment that switches off a lint,
# type or coverage check.
#
# Once the user approves an edit to a config file, later edits to that file in
# the same session go through, because a plan step that changes config usually
# takes several edits. PreToolUse records each config edit it asks about, and
# PostToolUse, which runs only once the edit has gone through, marks the file
# approved for the session.

input=$(cat)
event=$(jq -r '.hook_event_name // empty' <<<"$input")
session=$(jq -r '.session_id // empty' <<<"$input")
tool_use_id=$(jq -r '.tool_use_id // empty' <<<"$input")
cwd=$(jq -r '.cwd // empty' <<<"$input")
file_path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")

state_dir="${TMPDIR:-/tmp}/protect-config/${session:-none}"
approved="$state_dir/approved"

if [[ "$event" == "PostToolUse" ]]; then
  pending="$state_dir/pending-$tool_use_id"
  if [[ -n "$tool_use_id" && -f "$pending" ]]; then
    cat "$pending" >>"$approved"
    rm -f "$pending"
  fi
  exit 0
fi

ask() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: $reason}}'
  exit 0
}

case "$(basename "$file_path")" in
  biome.json | biome.jsonc | vitest.config.* | tsconfig*.json | lefthook*.yml | lefthook*.yaml)
    if [[ -n "$session" && -f "$approved" ]] && grep -qxF -- "$file_path" "$approved"; then
      exit 0
    fi
    if [[ -n "$session" && -n "$tool_use_id" ]]; then
      mkdir -p "$state_dir"
      printf '%s\n' "$file_path" >"$state_dir/pending-$tool_use_id"
    fi
    ask "Project config ($file_path). Only allowed if the user explicitly asked for this config change. Approving lets later edits to this file through for the rest of the session."
    ;;
esac

new_text=$(jq -r '[.tool_input.new_string, .tool_input.content, (.tool_input.edits // [] | .[].new_string)] | map(select(. != null)) | join("\n")' <<<"$input")
old_text=$(jq -r '[.tool_input.old_string, (.tool_input.edits // [] | .[].old_string)] | map(select(. != null)) | join("\n")' <<<"$input")

# Write has no old text in its input, so compare against the file as it is now.
if [[ -z "$old_text" && -f "$file_path" ]]; then
  old_text=$(cat "$file_path")
fi

pattern='biome-ignore|v8 ignore|c8 ignore|istanbul ignore|@ts-ignore|@ts-expect-error|@ts-nocheck'
lines() { grep -E "$pattern" <<<"$1" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g' | sort; }

# The edit's added comment lines: those in the new text beyond the old text's
# copies of the same line.
added=$(comm -23 <(lines "$new_text") <(lines "$old_text"))

# A comment line already in committed code is being moved, such as when code
# moves into a new file, and was reviewed when it was committed. Only a line
# with a reason after a colon counts, because a bare directive such as
# `@ts-expect-error` matches lines that suppress something else.
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  if [[ "$line" == *:* ]] && git -C "${cwd:-$CLAUDE_PROJECT_DIR}" grep -qF -e "$line" HEAD -- 2>/dev/null; then
    continue
  fi
  ask "Adds a comment that switches off a lint, type or coverage check ($file_path). Only allowed if the user explicitly asked for it."
done <<<"$added"

exit 0
