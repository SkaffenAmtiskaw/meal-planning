# Test-Only Steps
A test-only step's checks show that its tests catch real behavior.

## Break-It Checks
"Implementer: temporarily changes `<file>:<line>` from `<code>` to `<code>`, runs `<command> <test file>` and shows you these tests failing: `<test name>`, `<test name>`, then reverts. Proves: <what the tests catch>."

The command is `pnpm vitest run` for a unit test and `pnpm test:e2e` for an E2E spec.
- **Name every test that should fail,** from reading the test file, not just the one the check aims at, so a different set failing shows the plan misread the tests or a test is weaker than it looks. Name each E2E test with its project, since it runs in both `desktop` and `phone` unless it's limited to one.
- **Break behavior, not imports.** Changing a shared mock's default `ok: true` to `ok: false` shows which tests rely on success. Renaming its export fails every importer at once, which proves nothing.

To prove a test file no longer reaches a dependency: "Implementer: temporarily adds `throw new Error('x')` to `<dependency>`, runs `<command> <test file>` and shows you every test in it still passing, then reverts. Proves: <what the file no longer reaches>."
