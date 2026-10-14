---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Sweep's `/kickoff` step, which kicks off the collecting note into a dated copy.

**Full review here,** as the first story that uses them: `/kickoff`, `notes/templates/Sweep.md`.

**Re-checks for this step:** `roadmap-placement` (reviewed in Shared Note Procedures Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Kicking off a collecting note for the building goal:** `kickoff:75-83`, with mode lines at `:17,24,52`, used by `roadmap:84` and `roadmap-placement:18`, each of which reads all of `/kickoff`. The two have diverged: `roadmap:84` has no "an open kicked-off copy already exists, move the item into it" case, so it could make a second dated copy. It becomes a shared-rule skill, and `/kickoff` keeps sweeps and roundups.
- "After this" (:21-24) restates Note Conventions' Next Step table, and the per-type next step is also at :50-52 and :73; it's kept once, in step 3.
- :57 and :62 restate the Roadmap's line format and 🎯 rules. :60's 📌 question gets its one home in `roadmap-placement` ([[AGENTS.md Review]] moves the Roadmap rules there).
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- Its description is imperative, where `writing-standard`'s `instructions.md:23` asks for the third person; it becomes what and when, in about 25 words.
- **`Sweep.md`:** :21 (body text) copies the general sweep-or-roundup rule into every new note; each note keeps only its own topic rule. Its Items and issue format (`:26`) stays, since the template is its home, and its lifecycle sentences go.
- **The general rule copied into collecting notes:** Style Fixes, Code Tidy-Ups and Unit Test Tidy-Ups each carry the general sweep-or-roundup rule in What Belongs Here, and Style Fixes and Code Tidy-Ups have drifted from the template ("Give it its own Roadmap line until it's decided", with no roundup). Each keeps only its own topic rule. (Style Decisions, a roundup, is in [[Roundup Kickoff Review]].)
- **`filing-work`'s sweep-or-roundup home:** gets the `batch-small-test-cleanups` memory's leftover: write a single obvious follow-on action into the item rather than calling it a decision.
- Wording difference at `roadmap:84`: kick off every collecting note with an unblocked item for the building goal. Where the rule is kept: `roadmap-placement:18` says if a kicked-off copy is open, move the item into it. Exception or drift?
- Wording difference at the Out of Scope comment in `Sweep.md:30`: "work that belongs to another story, sweep or roundup, with a link". Where the rule is kept: AGENTS.md "Out-of-scope work" routes items to a note, a sweep, a roundup or a Roadmap line, or drops them. Exception or drift?

# Questions
