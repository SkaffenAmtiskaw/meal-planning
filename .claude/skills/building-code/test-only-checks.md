# Test-Only Checks
A change that touches only tests has break-it checks, plus E2E trace checks if it changes E2E code.

## Break-It Checks
For each one:
1. Make the edit exactly as written.
2. Run the command the check names, and record which tests failed.
3. Revert the edit, and check with `git diff` that the file is back to how it was.

If the tests that failed aren't exactly the ones the check names, don't change the tests or the check yourself. A different set means the check or a test is wrong, and which one is the user's call, so show them both lists and ask what to do.

## E2E Trace Checks
Run `pnpm test:e2e <spec file>` instead of `pnpm test:e2e:trace`, and record which tests passed in each project, because the trace command keeps a report server running until it's stopped, and watching the trace is the user's check.
