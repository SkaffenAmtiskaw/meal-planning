#!/bin/sh
# What `pnpm dev` runs: next dev on this checkout's PORT from .env.local (3000 if it has none).
# Next doesn't take its port from an env file, so this reads it. The port is always passed with -p,
# which makes Next fail on a taken port rather than move to the next one, so a worktree never ends
# up on another checkout's port.
# Usage: sh scripts/dev.sh [next dev options]

port=$(sed -n 's/^PORT=//p' .env.local 2>/dev/null | tail -n 1)
exec next dev -p "${port:-3000}" "$@"
