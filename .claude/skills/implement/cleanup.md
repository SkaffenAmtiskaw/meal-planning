# End-of-step cleanup
Make only these two edits, and only to files this step changed. Other tidying you might think of goes on the out-of-scope list.

1. **Import aliases.** In an `import`, replace a path with its alias when the alias is shorter.
2. **Shared mocks.** For each module mocked with `vi.mock` in this step's test files, apply "Creating Centralized Mocks" in `docs/unit_tests.md`, across the app. Count only factory bodies that are word-for-word the same. If a test file can't use the shared mock without changing a test's assertions, leave its own mock in place.

Then run `pnpm lint`, `pnpm check:types` and the tests of every file you touched again.
