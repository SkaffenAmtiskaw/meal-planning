#!/bin/bash
set -e

# Build --coverage.include flags for each staged file.
# vitest.config.ts exclude patterns still apply, so test/index/config
# files passed here are silently dropped from the coverage report.
include_args=()
for f in "$@"; do
  include_args+=("--coverage.include=$f")
done

pnpm vitest related --run --coverage "${include_args[@]}" --reporter=dot "$@"
