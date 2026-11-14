# Fixing a Bug
Reproduce a bug before you fix it. Then let the user say whether it's fixed, because a fix built on a wrong diagnosis can still pass your own checks.

1. **Get exact repro steps.** If the user hasn't said exactly how to make it happen, ask.
2. **Reproduce and diagnose it** as `reproducing-a-bug.md` in this skill's folder describes. Then tell the user the diagnosis in a few lines, and go on to fix it without waiting for their answer. They'll catch a wrong diagnosis when they check the fix in step 4.
3. **Fix it** as steps 2 and 3 of `SKILL.md` describe. If you reproduced the bug in a unit test, start from that test, since its passing is how the fix is verified. Then redo the acceptance checks the fix could affect.
4. **Ask the user to check it.**
5. **If it isn't fixed,** go back to step 2 and reproduce something more specific.
