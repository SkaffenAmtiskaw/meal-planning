#!/bin/sh
# Gives each checkout its own ports, hostname and database, so two worktrees can run the app side
# by side, and writes the checkout's gitignored .claude/launch.json for the preview.
# - The main checkout keeps ports 3000 and 3001, localhost and the `test` database. Its .env.local
#   isn't touched, and its launch.json is written only if it's missing.
# - A worktree with no PORT in its .env.local takes the lowest slot from 1 to 5 that no other
#   worktree's .env.local holds. Slot n gives ports 3000+10n and 3001+10n, the host
#   <worktree folder>.localhost and the database test-<n>. It writes PORT, SIGN_IN_PORT,
#   BETTER_AUTH_URL and DB_URL into the worktree's .env.local and writes its launch.json, then
#   empties test-<n>, in case the last worktree on the slot was removed without worktree-sweep.sh.
# - A worktree that has a slot keeps it, and its launch.json is written only if it's missing.
# On success it prints one line naming a new slot. On failure it prints what went wrong to stdout,
# where the SessionStart hook passes it to the session, and still exits 0, so the session starts.
# Usage: sh scripts/worktree-slot.sh <checkout folder>

[ "$CLAUDE_CODE_REMOTE" = "true" ] && exit 0

dir="${1:-.}"
git_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-dir) || exit 0
common_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir) || exit 0
top=$(git -C "$dir" rev-parse --show-toplevel)
env_file="$top/.env.local"
launch="$top/.claude/launch.json"

# The last value a .env.local file gives a key, or nothing.
value() {
  sed -n "s/^$2=//p" "$1" 2>/dev/null | tail -n 1
}

# Sets a key in .env.local, replacing its line or adding one. awk takes the value through the
# environment, so characters such as & in DB_URL stay as they are.
set_value() {
  K="$1" V="$2" awk '
    BEGIN { k = ENVIRON["K"]; v = ENVIRON["V"] }
    index($0, k "=") == 1 { if (!done) print k "=" v; done = 1; next }
    { print }
    END { if (!done) print k "=" v }
  ' "$env_file" > "$env_file.tmp" && mv "$env_file.tmp" "$env_file"
}

# $1: the dev port, $2: the sign-in port, $3: the host the preview opens.
write_launch() {
  mkdir -p "$top/.claude"
  cat > "$launch" <<EOF
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "dev",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "port": $1,
      "url": "http://$3:$1",
      "autoPort": false
    },
    {
      "name": "sign-in",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["sign-in"],
      "port": $2,
      "url": "http://$3:$2",
      "autoPort": false
    },
    {
      "name": "design-files",
      "runtimeExecutable": "sh",
      "runtimeArgs": ["-c", "pnpm dlx http-server@14.1.1 \\"\$(sh scripts/notes-dir.sh)/assets\\" -p 3002 -c-1 -s"],
      "port": 3002
    }
  ]
}
EOF
}

if [ "$git_dir" = "$common_dir" ]; then
  [ -f "$launch" ] || write_launch 3000 3001 localhost
  exit 0
fi

host="$(basename "$top" | tr '[:upper:]' '[:lower:]').localhost"

port=$(value "$env_file" PORT)
if [ -n "$port" ]; then
  [ -f "$launch" ] || write_launch "$port" "$(value "$env_file" SIGN_IN_PORT)" "$host"
  exit 0
fi

if [ ! -f "$env_file" ]; then
  echo "worktree-slot.sh: $top has no .env.local, so it gets no slot and can't run the app."
  exit 0
fi

# The slots other worktrees hold, from the PORT in each one's .env.local.
taken=$(git -C "$dir" worktree list --porcelain | sed -n 's/^worktree //p' | while IFS= read -r other; do
  [ "$other" = "$top" ] && continue
  other_port=$(value "$other/.env.local" PORT)
  [ -n "$other_port" ] && echo $(((other_port - 3000) / 10))
done)

slot=""
for n in 1 2 3 4 5; do
  if ! printf '%s\n' "$taken" | grep -qx "$n"; then
    slot=$n
    break
  fi
done

if [ -z "$slot" ]; then
  echo "worktree-slot.sh: all five worktree slots are taken by other worktrees, so $top has no ports or database and can't run the app until one of those worktrees is removed."
  exit 0
fi

db="test-$slot"
db_url=$(value "$env_file" DB_URL | sed -E "s#^([^/]*//[^/]*)/[^?]*#\\1/$db#")
case "$db_url" in
  */"$db"|*/"$db"\?*) ;;
  *)
    echo "worktree-slot.sh: couldn't find the database name in DB_URL in $env_file, so $top gets no slot."
    exit 0
    ;;
esac

dev_port=$((3000 + 10 * slot))
sign_in_port=$((3001 + 10 * slot))
set_value PORT "$dev_port"
set_value SIGN_IN_PORT "$sign_in_port"
set_value BETTER_AUTH_URL "http://$host:$dev_port"
set_value DB_URL "$db_url"
write_launch "$dev_port" "$sign_in_port" "$host"

echo "worktree-slot.sh: this worktree has slot $slot: the app at http://$host:$dev_port, sign-in links at http://$host:$sign_in_port, database $db."

if ! out=$(cd "$top" && pnpm --silent db:empty-worktree 2>&1); then
  echo "worktree-slot.sh: couldn't empty $db, so it may hold an earlier worktree's data. Run pnpm db:empty-worktree once the cause is fixed:"
  echo "$out" | tail -n 20
fi
exit 0
