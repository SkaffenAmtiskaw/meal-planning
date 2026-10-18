# Fixing a Bug
Most bad fixes come from guessing at behavior nobody has looked at, so reproduce a bug before you diagnose it, and let the user say whether it's fixed.

1. **Get exact repro steps.** If the user hasn't said exactly how to make it happen, ask, rather than starting from "it's broken".
2. **Reproduce it:**
   - **If it involves layout, position, size, scrolling, what's visible or timing,** such as mount order, effects or async order: reproduce it in the running app, as the `running-the-app` skill describes, and measure the values in question, such as `getBoundingClientRect()`, `scrollTop` or computed styles. Form no theory until you have them.
   - **Otherwise, such as a calculation, a conditional or a data transform:** reproduce it in a unit test that fails, since that test passing is how the fix is verified. If an existing test covers the behavior and passes, either the test is wrong or its mocks hide what's broken: say which, and make the test fail.
3. **Tell the user the diagnosis** in a few lines before fixing it, so a wrong one is caught before any code changes:
   - the file where the fault starts, not where the symptom shows
   - what that code does, and what it should do
   - the evidence, labeled "seen in the running app" or "reproduced in a unit test"
   - whether it's in one module or several
4. **Fix it** as steps 2 and 3 of `SKILL.md` describe, starting from the failing test you reproduced it with, if you wrote one. Then redo the acceptance checks the fix could affect.
5. **Ask the user to check it.**
6. **If it isn't fixed,** go back to step 2 and reproduce something more specific, rather than guessing again about the same behavior. Keep a list of the fixes you tried and what happened.
