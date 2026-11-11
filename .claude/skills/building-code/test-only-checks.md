# Test-Only Checks

## Break-It Checks
Do each one exactly as it's written, and record which tests failed. After you revert the edit, check with `git diff` that the file is back to how it was.

If the tests that failed aren't exactly the ones the check names, don't change the tests or the check yourself. A different set means the check or a test is wrong. Which one is wrong is the user's call, so show the user both lists, the tests that failed and the ones the check names, and ask what to do.

## E2E Runs
If the change touches E2E code, as `docs/e2e_tests.md` lists under "Where E2E Code Lives", run `pnpm test:e2e` on the specs it could affect, and report which tests passed in each project. This run is how a test-only change shows its specs pass, since `pnpm test:agent` runs only Vitest. Run it after you've reverted the break-it checks, because an edit left in would fail the specs it breaks. Don't use `pnpm test:e2e:trace`, even to look into a failure, because it keeps a report server running until it's stopped.
