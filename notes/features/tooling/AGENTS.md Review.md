---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Full review here:** AGENTS.md. Every workflow review before this one re-checked it for its own step; this review looks at it as a whole, knowing every step's needs.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-3]]

![[Agent Instructions Audit#^decision-5]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.

### Why the Implementation-Details Line Didn't Land
The Inbox item: AGENTS.md says implementation details are the agent's call, yet a session reminded Sarah three times that loading Note Conventions on demand reverses [[Notes Vault Repo]] decision 3, which is marked "Sarah's call". Found by reading AGENTS.md:15 and :21-31:
1. The exemption ("Implementation details that don't change what she sees are") is the third sentence of the "Her call, or what the app does: stop and ask her" bullet (:26), after the instruction. It reads as the counterpart of "even where she only approved it", so it covers only build choices she approved, never one marked as her call.
2. "Telling them apart" sorts choices by who made them, and "her own answer to a decision" makes any answer her call. Decision 3 changes that.
3. "Big" (:28) includes "reverses a **Decided** line" with no limit on what the line is about, so even an approved reversal forces a ⚠️ line.
4. The plumbing line (:15) is framed around routines and scripts, and "what she sees" is vague enough to cover how a file she reads loads.
5. No rule covers Sarah herself making a decision that changes an earlier one, so the agent raised it at every point it touched it.

The fix: the test of what a choice is about comes first. A choice about how something is built, such as a mechanism, where a file lives, how it loads, or which API or command flags a script uses, is the agent's call even when it's marked as Sarah's: make it and name it in the summary. "Big" covers only Decided lines about what the work does for her. When Sarah makes a new decision that changes an earlier one, the agent doesn't ask or warn, and names the affected note once in its summary. `answer-confidence:21` follows decision 3. Then the `dont-flag-reversed-build-decisions` memory is deleted, and `implement:165-166`, which restates the rule in other words, points to AGENTS.md.

A draft from the scan, for this review to start from. It replaces AGENTS.md:15 and the cases at :25-29, leaves "Telling them apart" and the two reason bullets as they are apart from decision 3, and needs decision 17's "the user" wording:

> - **What to ask about.** Ask Sarah about what the app does or shows, and about what tooling, CI or a routine does for her. How something is built is your call when it changes neither, such as a mechanism, a file's location, how a file loads, or which API or command flags a script uses: make it, and name it in your summary. She cares what the work does for her, not how it's built, so this holds even where an earlier decision about it says "Sarah's call".
>
> - **Her decisions can change.** Her decisions, including one made earlier in the same session, the rules, designs and plans she approves, and her own lines in notes are her best call with what was known at the time. They stand until something gives a reason to change one, so don't reopen one without a reason. Two things are a reason: *(the two reason bullets, unchanged)*
>
>   What you do with a reason depends first on what the choice is about, then on whose it is:
>   - **If it's only about how something is built,** as "What to ask about" describes: change it as for an only-approved choice below, as a small change, even if it's marked "Sarah's call".
>   - **If it changes what the app does or shows, or it's her call:** stop and ask her. Show her the simple way or the new information on its merits, what it solves and what it costs, name the decision, rule or line it would change, and let her decide. What the app does or shows is never an agent's to change, even where she only approved it. *(the tool example, unchanged)*
>   - **If it's only approved:** make the change. *(Recording text unchanged.)* How you tell her depends on its size:
>     - **Big:** it changes what tooling, CI or a routine does for her, drops a piece from an approved Design, or reverses a **Decided** line about one of those. Open your summary with a bold ⚠️ line for it.
>     - **Small:** anything else, such as order, structure, wording or plumbing. Name it in your summary.
>
>   If Sarah makes a new decision herself that changes an earlier one, she has already decided, so don't ask about the earlier one or warn her about it. Handle the note that holds it as your skill or "A note that's wrong or out of date" describes, and name it once, in your summary.

### Other Findings
- **Decision 5:** "Editing notes" moves into an `editing-notes` shared-rule skill, and the out-of-scope triage procedure moves to a shared-rule skill the same way. The rules for reading embeds and links stay.
- **Decision 3:** "Telling them apart" says "her own answer to a decision" makes any answer her call; under decision 3, only an answer with her own reason is. (`answer-confidence`'s side is in [[Shared Note Procedures Review]].)
- **Following links:** AGENTS.md gets a rule for following links, next to the embed rule: a link to a heading or a block (`[[#^piece-7]]`, `[[Note#Section]]`) points to content the line depends on, so read the target when that line matters to the work. Both rules stay in AGENTS.md when "Editing notes" moves out (decision 5).
- **"One at a time"** at :18, :106 and :115 (the last two in bold, which is emphasis too) repeats the question rule.
- **The 📌 question** (:80) is also in the Roadmap's Markers, `tooling:49` and `kickoff:60`; it gets one home in `roadmap-placement`, with the Roadmap rules below.
- **Inside "Editing notes", before it moves:** Where It Stands and the `^status` formats (:53-66, 436 words) are restated in five templates' comments, which decision 9 removes. :66 and :72 both say a finding for a later step goes at the top of that step's section. :47 puts the Check Drift prohibition between the bullet's opening and its cases; it becomes its own bullet. :85 ("A `ready` note goes back to `spec`") counts "Four changes don't count" and uses "a routed impact's acceptance check", which only `scope-router.md:20` explains; it becomes a condition with one example.
- **Roadmap rules that belong in `roadmap-placement`:** "A blocker outside the queue" (:77, no reason), "Starting on a story in the backlog" (:78-83, whose exception for `/implement` and `/tooling` comes after the instruction), and "A new item in a collecting note" (:84, whose only new content is that an item `/check-drift` moves back or `/kickoff` rolls over isn't new). :80's marker rule is also in the Roadmap's Markers, `tooling:49` and `kickoff:60`; the 📌 question gets one home in `roadmap-placement`.
- **Questions (:9-12):** :11's reason and :12's are the same fact ("she may see only the question"), so the bullets merge.
- **Doc gaps (:34-39):** three levels of nesting, with a step ("Drafting it") beside two cases; it becomes prose under "Anything else".
- **:14 and :19** say the same thing about open choices; :19 shortens to "ask about that choice alone".
- **Setup outside the repo (:13):** its second half restates the procedure for checks only Sarah can do; it becomes "walk the user through checks only they can do the same way".
- **:98, Immature stories:** an edge-case list of three kinds; it becomes the principle with one example.
- **:118, scratch files:** it says to link the report when showing findings, but not that the findings themselves go in chat; adding that makes the `scratch-files-not-for-sarah` memory redundant.
- **:145:** the break-it clause in the `pnpm test:agent` line repeats `implement/first-pass.md:28`; it goes.
- **:150, Git and files:** committing only this session's files leaves out the user's forgotten hand edits; the rule asks about each unexpected change, by file and content, and leaves a note another session is working on alone (from the `ask-about-unexpected-changes-when-committing` and `leave-other-sessions-notes-alone` memories).
- **:152-153:** the config and ignore-comment rules have no reason, and "explicitly" is emphasis.
- **Memory policy:** project rules live in checked-in files, memory holds only how to work with the user, and a memory is deleted once its rule is checked in (from `docs-updates-note-scope`, which holds it nowhere else). Any session can save a memory, so it goes in AGENTS.md.
- **Out-of-scope work:** another note's gaps against current conventions aren't an item, next to "Immature stories" (from `update-notes-when-touched`).
- **Routine sessions:** AGENTS.md loads into every routine session, and most of it is for interactive sessions; decision 5 removes the biggest part.
- Wording difference: AGENTS.md:150 says "Don't commit unless Sarah asks"; `dependency-updates` and `ci-failure` commit and push unasked. Exception or drift?
- **Memories that move here, then are deleted:** `ask-about-unexpected-changes-when-committing`, `leave-other-sessions-notes-alone` (the commit rule above), `scratch-files-not-for-sarah` (:118 above), `update-notes-when-touched` (Out-of-scope work above), `dont-flag-reversed-build-decisions` (the implementation-details fix above), `docs-updates-note-scope` (the memory policy above), and `block-on-unbuilt-skills` and `remove-without-tombstones` (to `editing-notes`).

Moved from Agent Workflow Changes 2026-10-02 on 2026-10-06:
- [Sarah] - agents should only ask for approval for the "Where It Stands" status updates if there's genuine ambiguity.

Moved from Agent Workflow Changes on 2026-10-06:
- **Skills that change files end with a per-file table** - every skill that changes files ends its summary with a table: one row per changed file, the file as a markdown link Sarah can click, and a one-line summary of its change, as `/tooling` step 3 and `/implement`'s Build Order report already do. Sarah wants it standard after `/infra-design`'s closing summary on Major Upgrade Sweeps (2026-10-06) wasn't one.

# Questions
