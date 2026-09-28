# End-of-step cleanup
Make only these two edits, and only to files this step changed. Other tidying you might think of goes on the out-of-scope list.

1. **Import aliases.** In an `import`, replace a path with its alias when the alias is shorter.
2. **Shared mocks.** For each module mocked with `vi.mock` in this step's test files, count the test files across the app that mock the same module path with a factory body that is word-for-word the same. If there are 3 or more, and `test/mocks/` has no file for that module yet, move the mock to `test/mocks/<module name>.ts`, matching the structure of the existing files there. Then, for each of those test files: if it can't use the shared mock without changing a test's assertions, leave its own mock in place. Otherwise, have it import the shared mock, the way test files import the existing ones.

Then run `pnpm lint`, `pnpm check:types` and the tests of every file you touched again.
