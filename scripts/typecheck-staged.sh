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
# .next/types must be included so globally-declared types (PageProps, LayoutProps) are available
cat > "$TSCONFIG" <<EOF
{
  "extends": "./tsconfig.json",
  "files": $files_json,
  "include": [".next/types/**/*.ts", "src/**/*.d.ts"]
}
EOF

pnpm tsc --noEmit --project "$TSCONFIG"
