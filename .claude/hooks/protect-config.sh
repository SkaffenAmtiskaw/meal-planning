#!/bin/bash
# PreToolUse and PostToolUse hook: asks the user before an edit touches lint,
# type, coverage or git hook config, and blocks an edit that adds a comment that
# switches off a lint, type or coverage check to a code file.
#
# The permission prompt shows the user only which file is being edited, not this
# hook's reason, so a prompt for a file the plan edits gives them no sign that it
# holds an ignore comment. So a new comment is blocked, and the block's reason
# sends the agent to fix the code or ask the user in chat. A retry of the same
# comment lines in the session comes after the user agreed, so it asks.
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

deny() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
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

# Only code files can hold a comment that switches off a check. A note, report
# or skill that names one, such as `biome-ignore`, is prose.
case "$file_path" in
  *.ts | *.tsx | *.mts | *.cts | *.js | *.jsx | *.mjs | *.cjs | *.css | *.json | *.jsonc) ;;
  *) exit 0 ;;
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

repo="${cwd:-$CLAUDE_PROJECT_DIR}"

# How many lines hold the text, in HEAD or in the files as they are now,
# including new files not yet committed. git grep -c prints `path:count`, or
# `HEAD:path:count`.
count_in_head() {
  git -C "$repo" grep -c -F -e "$1" HEAD -- 2>/dev/null | awk -F: '{ n += $NF } END { print n + 0 }'
}
count_now() {
  git -C "$repo" grep -c -F --untracked -e "$1" -- 2>/dev/null | awk -F: '{ n += $NF } END { print n + 0 }'
}

# A comment line is being moved, such as when code moves into a new file, when
# committed code holds it and the files now hold fewer copies than HEAD, because
# the old copy is gone. It was reviewed when it was committed. A copy of the
# same wording into new code leaves the count where it was, so it counts as
# added. Only a line with a reason after a colon counts as moved, because a
# bare directive such as `@ts-expect-error` matches lines that suppress
# something else.
denied="$state_dir/denied"
retry=true
new=()
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  if [[ "$line" == *:* ]] && (($(count_now "$line") < $(count_in_head "$line"))); then
    continue
  fi
  new+=("$line")
  if [[ -z "$session" || ! -f "$denied" ]] || ! grep -qxF -- "$line" "$denied"; then
    retry=false
  fi
done <<<"$added"

[[ ${#new[@]} -eq 0 ]] && exit 0

if $retry; then
  ask "Adds a comment that switches off a lint, type or coverage check ($file_path). Approve only if you agreed to this comment in chat."
fi

if [[ -n "$session" ]]; then
  mkdir -p "$state_dir"
  printf '%s\n' "${new[@]}" >>"$denied"
fi
deny "Blocked: this edit adds a comment that switches off a lint, type or coverage check ($file_path). AGENTS.md's Checks rule allows one only when the user asks for it. If you're moving the comment from another file, remove it there first, then make this edit again. Otherwise, change the code so the check passes without it. If it can't, ask the user in chat, saying why the comment is needed and that approving means a permission prompt to edit $(basename "$file_path"), because the prompt names only the file. If they agree, make the same edit again."
