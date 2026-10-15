# Test-Only Steps
A test-only step's checks show that its tests catch real behavior.

## Break-It Checks
"Temporarily change `<file>:<line>` from `<code>` to `<code>`, run `<command> <test file>`, see these tests fail: `<test name>`, `<test name>`. Revert. Proves: <what the tests catch>."

The command is `pnpm vitest run` for a unit test and `pnpm test:e2e` for an E2E spec.
- **Name every test that should fail,** from reading the test file, not just the one the check aims at, so a different set failing shows the plan misread the tests or a test is weaker than it looks. Name each E2E test with its project, since it runs in both `desktop` and `phone` unless it's limited to one.
- **Break behavior, not imports.** Changing a shared mock's default `ok: true` to `ok: false` shows which tests rely on success. Renaming its export fails every importer at once, which proves nothing.

To prove a test file no longer reaches a dependency, add `throw new Error('x')` to the dependency and see every test in the file still pass.

## Run-and-See Checks
An E2E trace records the browser as the test runs, so watching one shows the user that a test does what it claims:

"Run `pnpm test:e2e:trace <spec file>`, open the trace for `<test name>` in `<project>`, see <what the browser does>. Proves: <what the test shows>."
