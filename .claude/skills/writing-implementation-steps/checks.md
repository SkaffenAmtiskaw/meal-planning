# Writing Checks
Which kind of check a step gets depends on what it changes:
- **If it changes only what enforces a pattern's Convention or where the Convention is written, such as a Biome ban, a conventions test or a doc:** the Enforcement and doc checks below.
- **Otherwise, if it changes only test files:** break-it checks, written as `test-only-checks.md` in this skill's folder describes.
- **Otherwise, if it's meant to leave the app looking and working exactly as before, such as a refactor, a move or a rename:** the Approach names the existing flows the implementer clicks through and the unit and E2E tests it runs that cover the changed code. What the user gets depends on the change:
  - **If it could alter how a screen looks, such as a replaced component:** a click-through of that screen, because whether it still looks right is their judgment.
  - **Otherwise:** no check. Its Acceptance is `None for the user: <the implementer's runs that cover it>`.
- **Otherwise:** click-throughs in the running app, "Go to [view], [do something], see [result]", naming the screen size (phone or desktop), the data needed, such as a day with two meals, and any signed-in user, as `.claude/skills/running-the-app/which-user.md` describes.

Some steps also need a particular check, on top of the kind above:
- **If its Source names a Symptom:** follow the Symptom's repro steps, which should no longer show the bug.
- **If it builds a failure, empty or read-only behavior:** check that behavior.
- **If it builds an Enforcement item:** break what it enforces. "Temporarily add `<code>` to `<file>`, run `<command>`, see it fail with `<the error or rule it reports>`. Revert. Proves: <what the item catches>."
- **If it writes a Convention into a doc:** open the doc at its section and read it there.

Each check:
- **Proves what the step built.** "Tests pass" and "types compile" aren't checks, since they hold for every step, and neither is a library's default behavior, such as a Mantine Popover flipping above its trigger, which the user trusts without checking.
- **Ends with "Proves: <what it shows>",** so the user knows what it will teach them before spending time on it.
- **Is usable as written.** It spells out the command the user runs, the text they paste or the screen they open, or, if that's only known at build time, such as a token, says the implementer gives it to them. It never sends them elsewhere in the note, such as to "Step 1's token".

## The User's Checks and the Implementer's
Each check costs the user time, so the user's checks stay within the limits below, and anything else the step needs verified goes in its Approach, for the implementer:
- **A case or two per rule.** A block of cases sharing one mechanism, such as the bans in one Biome override, fails together, so one case proves the block.
- **The finished step only.** The user never checks the old behavior first. Break-it checks are fine, since they're edits to the finished step.
- **Nothing already shown.** If an earlier check, or a run the implementer can do on its own machine, already proves something, there's no check for it. Those runs include the existing unit and E2E tests, so read the ones that cover the step's flows before writing a check of a flow, and especially before writing one that needs the user to sign in somewhere or open an outside dashboard. For example, a step that moves the email senders needs no look at the sent emails in Resend's dashboard, because the E2E suite reads them back from its fake Resend. Nor is there any need to break a secret on GitHub to see a job fail when the implementer can run the job's script against a local server that returns 401.
