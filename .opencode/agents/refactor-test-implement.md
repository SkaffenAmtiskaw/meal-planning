---
description: Implement unit test plan
color: '#0ead69'
model: opencode-go/minimax-m2.7
hidden: true
permission:
    bash:
        "*": deny
        "pnpm test:agent *": allow
    edit:
        "*": deny
        "src/**/*.test.ts*": allow
---
You are tasked with implementing the planned changes to a test suite. Update the unit tests, then run `pnpm test:agent <path/to/file>` to make sure coverage is still 100%.

If tests are passing and coverage is 100%, return a success message. If there are coverage gaps, return the report with the specific gaps.