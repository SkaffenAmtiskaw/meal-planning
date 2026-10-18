---
type: workflow
confirmed: 2026-10-18
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

Writing Reviewer Misses Criteria tested `writing-reviewer` on scratch copies of `/implement` and `building-code`, as Feature Implement Review left them. The test runs also reported possible problems in the parts that match the shipped text of both skills. Sarah decided on 2026-10-18 that they get a story of their own, worked before [[Feature Final-Review Review]], because anything the first `/implement` review should have caught, but didn't because `writing-reviewer` wasn't fixed yet, belongs here.

The findings aren't verified. Line numbers are as of 2026-10-18, and the number after each is how many test runs reported it.

**`/implement` and `bugs.md`:**
- **Triage of late out-of-scope items, in two files.** `implement/SKILL.md:61` triages them after the user confirms the step is done, then handles one the user pulls in as the first two cases above it describe, so the item is built and recorded as As built, or sends the story back to re-planning, without the user reviewing it (3). `implement/re-planning.md:12` triages after steps 2-4 have written the As built note, the Inbox item, `status` and Where It Stands, so a pulled-in item has no stated place to go (2). [[AGENTS.md Review]] moves the triage procedure into a shared-rule skill (decision 5), so check whether the fix belongs there.
- `implement/SKILL.md:56`: step 4 sends feedback to `building-code`'s "Handle the User's Feedback" before it says to sort where a change goes (2).
- Possible cuts in `implement/SKILL.md`: `:17` "The plan is how they make sure what gets built is what they expected.", `:40` "Leave out the choices the user answered in this session." (3), `:53` "Then stop and wait.", `:64` "Once the user confirms:".
- Wording difference at `building-code/bugs.md:7`: a logic bug is reproduced in a unit test. Where the rule is kept: `investigate/SKILL.md:20`, which says every bug is reproduced in the running app unless Sarah signs off. Exception or drift? (1)
- `building-code/bugs.md:8`: unclear whether telling the user the diagnosis waits for their answer before the fix (1).
- Possible cuts at `building-code/bugs.md:15`: "rather than guessing again about the same behavior" and "Keep a list of the fixes you tried and what happened" (1 each).

**`building-code`'s SKILL.md, `design-comparison.md` and `test-only-checks.md`:**
- `building-code/SKILL.md:13`: the UI-elements bullet says to use the plan's component before it gives the case that makes it an open choice (3).
- `building-code/SKILL.md:53-56`: the can't-run and covered-by-another-run cases come after the list whose item 3 says to do each check as written, and the covered-run sentence reads as applying to checks the agent can run too (3).
- `building-code/SKILL.md:53-54` with `design-comparison.md:6`: a fix made from the design comparison gets no rerun of the tests and checks, though item 4 reruns them after a failed check (3).
- Possible cut at `building-code/SKILL.md:21`: "say so in your report, so it doesn't look like padding" (2).
- `building-code/SKILL.md:23`: "plumbing" is the only exemption from asking about an open choice and isn't defined (1). AGENTS.md uses "plumbing" for tooling and routines, and [[AGENTS.md Review]] rewrites that line, so check which meaning this line needs.
- Wording difference at `building-code/SKILL.md:23`: an open choice is every decision the plan doesn't make unless a listed source settles it. Where the rule is kept: AGENTS.md "Open choices are hers" (two reasonable readings, and nothing written picks one). Exception or drift? (1)
- Possible cut at `design-comparison.md:2`: "Designs aren't pixel perfect, but the build should mostly match them." (2). The Memory Folder Review table lists `design-comparison.md:2-6` and `building-code/SKILL.md:13-16` as where the `designs-mostly-not-pixel-perfect` rule is kept, so a cut means lines 3-6 carry it or the memory stays.
- Wording difference at `design-comparison.md:5`: it asks the user only where the design disagrees with "something the user said in this session". Where the rule is kept: the Feature and Hub templates' Meta-Instructions, which say to ask where the design conflicts with "the user's instructions" and which decision 16 keeps word for word. Exception or drift? (1)
- `building-code/test-only-checks.md:2`: the opening line restates the planner's rule in `writing-implementation-steps/test-only-checks.md` and calls run-and-see checks "E2E trace checks" (3).

**`building-code` lines tied to the infra path:**
- `building-code/SKILL.md:3`: the description says "the app's code", narrower than the body, which also builds infra Build Order steps (`:45`) (1). [[Agent Instructions Audit]]'s decision 8 moves the infra path out of `/implement`, and [[Infra Implement Review]] settles whether it keeps using `building-code`, so check what the description should cover.
- Possible cut at `building-code/SKILL.md:45`: ""Sarah checks: none" means it has none" (2). [[Infra Implement Review]] lists this line as infra path, so cutting it may wait for that review.

# Questions
