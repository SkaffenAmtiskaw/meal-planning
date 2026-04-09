---
name: write-tests
description: instructions for writing unit tests
---

Unit tests serve as a document of developer intent in addition to helping prevent regressions. Tests should be designed with documentation, as well as coverage, in mind.

Naming
- camel case names should be changed to more human-readable titles

Data
- when creating mock data - use obviously fake data if possible - Disney villains is a typical theme

TSX Files
- `.tsx` files should be concerned with presentation - logic should be handled elsewhere - if you need to write extensive tests for a .tsx file it is a design smell and should be flagged for the user
- presentational JSX (layout, styling props, conditional class names) should not be tested — focus only on logic: data flowing to child components, routing behavior, and rendered output that depends on props or state
- a good rule of thumb: if the test would only break when markup changes (not behavior), skip it

Imports
- all imports — including mocked modules — should be declared at the top of the file, not inside individual tests
- do not use dynamic `await import(...)` inside a test body to access a mocked module; import it at the top level and use `vi.mocked()` to interact with it

Mocking
- external dependencies should USUALLY be mocked to isolate the module being tested
- check the `test/mocks` directory to see if there are pre-existing mocks for the dependency in question
- if the same mock is created in multiple test files a reusable mock should be created in `test/mocks`
- external dependencies should not be mocked if the mock itself creates more complexity than allowing the dependency to be called
- too many mocks is a design smell - the module should be decomposed into smaller submodules

Selectors
- add `data-testid` attributes to interactive elements in components so tests can select them with `screen.getByTestId(...)` — do not rely on text labels, which can change for copy/UX reasons

Future Behavior
- use `test.skip` to document behavior that is planned but not yet implemented
- the test name should describe the intended future behavior clearly
- include a comment inside explaining what needs to be built before the test can be enabled

Shared Setup
- anything that applies to ALL unit tests (as opposed to a specific module) belongs in `test/` at the project root
- module-specific helpers or fixtures belong co-located with the tests that use them, not in `test/`