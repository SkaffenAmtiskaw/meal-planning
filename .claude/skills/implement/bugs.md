# Fixing a bug
A bug is when something doesn't do what its step or its design says. Most bad bug fixes come from guessing at runtime behavior nobody has looked at. So look first, then fix, and let Sarah say whether it's fixed.

These rules are shared: any skill that fixes bugs in this project can follow this file.

1. **Get exact repro steps.** If Sarah hasn't said exactly how to make it happen, ask. Don't start from "it's broken" or "doesn't work right".
2. **Look before you diagnose.** If the bug involves layout, position, size, scrolling, what's visible, or timing (mount order, effects, async order), reproduce it in the browser pane first. Measure the specific values in question, like `getBoundingClientRect()`, `scrollTop` or computed styles. Don't form a theory about it until you have the measurements. A pure logic bug, like a calculation, a conditional or a data transform, can be diagnosed from the code. `first-pass.md` in this skill's folder explains starting the app and signing in.
3. **Tell Sarah the diagnosis** in a few lines before fixing it:
   - the file where the fault starts, not where the symptom shows
   - what that code does, and what it should do
   - the evidence, labeled "seen in the browser" or "from reading the code"
   - whether it's in one module or several

   If the fix involves an open choice, ask her about it now.
4. **Check the existing tests** and say which case applies:
   - A test covers the behavior, but the code is wrong: fix the code.
   - No test covers the behavior: write a failing test first, then fix the code.
   - A test covers it and passes, but the behavior is still wrong: either the test is wrong, or its mocks hide the exact thing that's broken. Say which.
5. **Fix it,** then run the checks and the first-pass checks the fix could affect.
6. **Ask Sarah to check it.** Don't report it as fixed yourself. It's fixed when she says so.
7. **If it isn't fixed,** go back to step 2 and measure something more specific. Don't try a second guess about the same behavior. Keep a list of the fixes you tried and what happened.
