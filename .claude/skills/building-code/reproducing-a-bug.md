# Reproducing and Diagnosing a Bug
Reproduce a bug from exact repro steps before you diagnose it. A diagnosis of behavior nobody has seen is a guess, and a fix built on a guess often fixes the wrong thing.

## Reproducing It
How you reproduce a bug depends on what it involves:
- **If it involves layout, position, size, scrolling, what's visible or timing (such as mount order, effects or async order):** have the `bug-reproducer` subagent reproduce it in the running app. Unit tests run in jsdom, which doesn't lay out the page and doesn't time things the way a browser does, so a unit test of one of these can pass while the bug is there. Send the subagent the repro steps, the symptom and the values that would show the symptom plainly, such as `getBoundingClientRect()`, `scrollTop`, a computed style or the console error after Save. Don't send it your theory of the cause, because an agent with a theory tends to see what it expects.
- **Otherwise, such as a calculation, a conditional or a data transform:** reproduce it in a unit test that fails. If an existing test covers the behavior and passes, either the test is wrong or its mocks hide what's broken. Say which, and make that test fail rather than writing a new one.

## Diagnosing It
Find where the fault starts, not where the symptom shows. The diagnosis has to explain each value the subagent measured, or why the test fails. It gives these four things:
- the file where the fault starts
- what that code does, and what it should do
- the evidence, labeled "seen in the running app" or "reproduced in a unit test"
- whether the fault is in one module or several
