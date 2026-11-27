# Writing Checks
A step's checks prove what it built. Each check is the user's or the implementer's, depending on what it shows:
- **If it's about how a screen looks or feels to use,** such as a card's layout, a label's wording or whether a scroll feels smooth: it's the user's, and its line has no prefix.
- **Otherwise, if the implementer can't see its result,** such as what a screen reader says or something on a page only the user can sign in to: it's the user's too.
- **Otherwise:** it's the implementer's, and its line starts with `Implementer:`, such as "Implementer: Signed in as `read`, open the list view: no day has a +. Proves: a `read` member can't add a meal."

The user wants to judge how the app looks and feels themselves, and not to spend time on checks the implementer can see for itself (Sarah's call). An `Implementer:` check is still an acceptance check: it proves something the step builds, and the user sees its result, such as a screenshot, in the implementer's report. The tests and regression click-throughs the implementer runs for its own confidence go in the Approach instead.

Which kind of check a step gets depends on what it changes:
- **If it changes only what enforces a pattern's Convention or where the Convention is written, such as a Biome ban, a conventions test or a doc:** the Enforcement and doc checks below.
- **Otherwise, if it changes only test files:** break-it checks, written as `test-only-checks.md` in this skill's folder describes.
- **Otherwise, if it's meant to leave the app looking and working exactly as before, such as a refactor, a move or a rename:** the Approach names the existing flows the implementer clicks through and the unit and E2E tests it runs that cover the changed code. What the user gets depends on the change:
  - **If it could alter how a screen looks, such as a replaced component:** a click-through of that screen, because whether it still looks right is their judgment.
  - **Otherwise:** no check. Its Acceptance is `None for the user: <the implementer's runs that cover it>`.
- **Otherwise:** click-throughs in the running app, "Go to [view], [do something], see [result]", naming the screen size (phone or desktop), the data needed, such as a day with two meals, and any signed-in user, as `.claude/skills/running-the-app/which-user.md` describes.

Some steps also need a particular check, or tests the Approach names, on top of the kind above:
- **If its Source names a Symptom:** follow the Symptom's repro steps, which should no longer show the bug.
- **If it builds a failure, empty or read-only behavior:** check that behavior.
- **If it adds or changes a control on a screen, other than in a step meant to leave the app as before:** an implementer check that the keyboard reaches each control the step adds or changes, in a sensible order, with focus visible. That way a problem is fixed in the story that caused it rather than found in the release's accessibility audit (Sarah's call).
- **If there's reason to expect a screen reader to announce what the step builds in an unusual way,** such as a control built without a Mantine component, content that changes without the user moving to it, or focus the code moves: a user check with a screen reader, naming what they should hear. Otherwise, screen readers are left to the release's accessibility audit (Sarah's call).
- **If it adds or changes a server action or read that touches a planner's data:** the Approach names the access tests that "Testing a Planner Access Check" in `docs/unit_tests.md` describes. Without them, a missing or wrong level would be found only by the release's security audit.
- **If it builds an Enforcement item:** break what it enforces. "Implementer: temporarily adds `<code>` to `<file>`, runs `<command>` and shows you it failing with `<the error or rule it reports>`, then reverts. Proves: <what the item catches>."
- **If it writes a Convention into a doc:** open the doc at its section and read it there.

Each check:
- **Proves what the step built.** "Tests pass" and "types compile" aren't checks, since they hold for every step, and neither is a library's default behavior, such as a Mantine Popover flipping above its trigger, which the user trusts without checking.
- **Ends with "Proves: <what it shows>",** so the user knows what it will teach them before spending time on it or on what the implementer found.
- **Is usable as written.** It spells out the command to run, the text to paste or the screen to open, or, if that's only known at build time, such as a token, says the implementer gives it to the user. It never sends the reader elsewhere in the note, such as to "Step 1's token".
- **Keeps the user out of the worktree.** The step is built in a worktree, and the user never opens or edits a file there, because working in a worktree is a pain for them. So if a check needs a temporary edit, such as a break-it check, it's the implementer's, and the implementer shows the user the output.

## Keeping Checks Few
Each check costs the user time, either to run it or to read what the implementer found, so every check stays within these limits, and anything else the step needs verified goes in its Approach, for the implementer:
- **A case or two per rule.** A block of cases sharing one mechanism, such as the bans in one Biome override, fails together, so one case proves the block.
- **The finished step only.** No check looks at the old behavior first. Break-it checks are fine, since they're edits to the finished step.
- **Nothing already shown.** If an earlier check, or a run the implementer can do on its own machine, already proves something, there's no check for it. Those runs include the existing unit and E2E tests, so read the ones that cover the step's flows before writing a check of a flow, and especially before writing one that needs the user to sign in somewhere or open an outside dashboard. For example, a step that moves the email senders needs no look at the sent emails in Resend's dashboard, because the E2E suite reads them back from its fake Resend. Nor is there any need to break a secret on GitHub to see a job fail when the implementer can run the job's script against a local server that returns 401.
