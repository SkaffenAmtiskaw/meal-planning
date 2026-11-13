# What Gets E2E Tests
This doc is for anyone planning or reviewing a change to the app. It says which E2E tests a change adds or updates. How to write and run them is in `docs/e2e_tests.md`.

E2E tests protect the app's user flows: what a user does through the browser from start to end, such as adding a meal to a day or accepting an invite. Each one is slow to run and breaks when a flow's screens change, so E2E tests cover the paths users depend on, and unit tests cover the rest, as `docs/unit_tests.md` describes.

## Flows a Change Adds or Changes
A change that adds a user flow, or changes what a user does or sees in an existing one, adds or updates an E2E test of that flow's main path. The main path is the way through that ends in what the user came to do, such as the saved meal showing on its day.

Form-level validation, such as a required field's message, stays in unit tests, and so does other behavior inside a single component. Unit tests reach each of those cases faster and more directly.

## Failures the User Sees
How a failure the app shows the user is tested depends on whether a browser can cause it and how far its handling goes:
- **If the failure can't be caused through the browser,** such as a database error: it stays in unit tests, however it's handled.
- **If the app only shows an error message,** such as a notification that a save failed: it stays in unit tests, because it's one component's behavior.
- **If the handling goes further,** such as a redirect, a retry, putting back what was on screen or a way for the user to recover: it works like a flow of its own. Whether it gets an E2E test is the project owner's call, made for each change when it's planned. They weigh how much it would hurt users if the handling broke against the cost of one more E2E test.

## Bug Fixes
How a bug fix is tested depends on whether a marked test already waits on it and what the bug broke:
- **If the flow's E2E test is marked `test.fail()` for the bug:** the fix takes the marker out, as "Tests a Known Bug Breaks" in `docs/e2e_tests.md` describes.
- **If the bug broke a flow's main path and no E2E test caught it:** the fix adds the test that would have, so the bug can't come back unnoticed.
- **Otherwise:** the fix's test, if it needs one, is a unit test.
