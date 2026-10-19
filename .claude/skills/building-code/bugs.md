# Fixing a Bug
Most bad fixes come from guessing at behavior nobody has looked at, so reproduce a bug before you diagnose it, and let the user say whether it's fixed.

1. **Get exact repro steps.** If the user hasn't said exactly how to make it happen, ask.
2. **Reproduce it:**
   - **If it involves layout, position, size, scrolling, what's visible or timing,** such as mount order, effects or async order: have the `bug-reproducer` subagent reproduce it in the running app. Send it the repro steps, the symptom and the values to capture, such as `getBoundingClientRect()`, `scrollTop` or computed styles. Don't send it your theory of the cause, because an agent with a theory tends to see what it expects.
   - **Otherwise, such as a calculation, a conditional or a data transform:** reproduce it in a unit test that fails. That test passing is how the fix is verified.
     - **If an existing test covers the behavior and passes,** either the test is wrong or its mocks hide what's broken: say which, and make that test fail.
     - **If no test covers it:** write a new one that fails.
3. **Check the diagnosis against the evidence:** it has to explain each value the subagent measured, or why the test fails. Then tell the user the diagnosis in a few lines:
   - the file where the fault starts, not where the symptom shows
   - what that code does, and what it should do
   - the evidence, labeled "seen in the running app" or "reproduced in a unit test"
   - whether it's in one module or several

   Go on to fix it without waiting for their answer. They'll catch a wrong diagnosis when they check the fix in step 5.
4. **Fix it** as steps 2 and 3 of `SKILL.md` describe, starting from the failing test you reproduced it with, if you wrote one. Then redo the acceptance checks the fix could affect.
5. **Ask the user to check it.**
6. **If it isn't fixed,** go back to step 2 and reproduce something more specific.
