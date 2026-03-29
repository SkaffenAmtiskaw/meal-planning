#!/bin/bash

TSCONFIG=tsconfig.staged.json

# Remove any pre-existing temp tsconfig
rm -f "$TSCONFIG"

# Ensure cleanup on exit (success, failure, or interrupt)
trap 'rm -f "$TSCONFIG"' EXIT

# Build JSON array of staged files
files_json=$(printf '"%s",' "$@")
files_json="[${files_json%,}]"

# Write a temp tsconfig that extends the main one but only roots the staged files
cat > "$TSCONFIG" <<EOF
{
  "extends": "./tsconfig.json",
  "files": $files_json,
  "include": []
}
EOF

pnpm tsc --noEmit --project "$TSCONFIG"
