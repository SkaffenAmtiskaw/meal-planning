---
type: 
status: idea
confirmed: 2026-09-26
---
# Where It Stands

No direction yet. Next: /shape ^status

# Notes
The planned agent for `pattern` · `spec` notes (see Next Step by Note State in [[Note Conventions]]). It writes Rules, Enforcement and the Migration Checklist, then the implementation steps. Nothing is built yet. [[Unit Testing - New Centralized Mocks]] is a `pattern` that changes only test files, so it will need the convention below.

Today the `/plan-steps` skill (`.claude/skills/plan-steps/SKILL.md:64`) and the `plan-checker` agent (`.claude/agents/plan-checker.md:22`) require every acceptance check to be a click-through in the running app. That doesn't work for stories that change only test files.

## Conventions it must follow
- **Break-it checks for test-only stories.** When a story's steps change only test files, nothing in the running app changes. Each step's acceptance checks are break-it checks instead of click-throughs: temporarily break the matching line in the source file (or the shared mock in `test/mocks/`), run the one test file with `pnpm vitest run <test file>`, see the named test fail, then revert. This proves every kept or rewritten test catches real behavior. Each check names the file and line, the exact edit, the test file to run and the test that should fail. Every temporary edit is reverted before the next check. Approved by Sarah 2026-09-26 while planning the Unit Testing - Clean Up Mocks story.
	- A check that only breaks imports is not a meaningful check. An example is renaming a shared mock's export to prove a test file uses the shared mock. It breaks imports everywhere and proves nothing. The `vi.mock` line in the diff already shows which mock a file uses. Decided by Sarah 2026-09-26.
	- Breaking a shared mock's behavior is meaningful. For example, change a default `ok: true` to `ok: false` in `test/mocks/@/_actions/library.ts`, then see the test that relies on the success default fail.
	- A check can also prove isolation. Add `throw new Error('x')` to a dependency the tests should no longer reach, then see every test still pass.

# Questions
- Test-only stories aren't always patterns. Cleanups and the dated copies of [[Unit Test Tidy-Ups]] are planned with `/plan-steps`, and `plan-checker` would flag break-it checks there. Does the break-it rule also go into `/plan-steps` and `plan-checker`, or only into this agent?
- Should a break-it check name every test the break is expected to fail, not just the one it targets? In Unit Testing - Clean Up Mocks, Sarah twice found a break failing more tests than the check named: forcing `has-password` at `SignInFlow.tsx:94` failed 11 tests, and emptying `plannerId` at `BookmarkForm.tsx:52` also failed the edit test.
