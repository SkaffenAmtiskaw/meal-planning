# Test-Only Checks

## Break-It Checks
Do each one exactly as it's written, and record which tests failed. After you revert the edit, check with `git diff` that the file is back to how it was.

If the tests that failed aren't exactly the ones the check names, don't change the tests or the check yourself. A different set means the check or a test is wrong. Which one is wrong is the user's call, so show the user both lists, the tests that failed and the ones the check names, and ask what to do.

## Run-and-See Checks
Run `pnpm test:e2e <spec file>`, not `pnpm test:e2e:trace`. The trace command keeps a report server running until it's stopped, and watching the trace is the user's check. Record which tests passed in each project.
