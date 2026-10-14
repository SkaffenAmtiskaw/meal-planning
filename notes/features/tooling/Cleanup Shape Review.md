---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Cleanup's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `notes/templates/Cleanup.md`.

**Re-checks for this step:** `/shape`, the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `settling-a-decision` (reviewed in [[Feature Decide Review]]); `roadmap-placement`, `deleting-a-note` (reviewed in Shared Note Procedures Review); the `scope-router` agent (reviewed in [[Scope-Router Review]]); `notes/templates/Idea.md` (reviewed in [[Feature Template Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- `Cleanup.md:34` sets status and `:18` says to use another template, repeating the skills and Note Conventions.
- Wording difference at the Out of Scope comment in `Cleanup.md:27`: "each item should also be on the Roadmap". Where the rule is kept: AGENTS.md "Out-of-scope work" routes items to a note, a sweep, a roundup or a Roadmap line, or drops them. Exception or drift?

# Questions
- Was `cleanup` the right type for [[Agent Instructions Audit]], an audit of agent instructions? `cleanup` sent it on to `/plan-steps`, whose checks assume a running app, and Sarah said on 2026-10-06 that `/plan-steps` was a bad fit for it. Either `cleanup` was the wrong type, or `/plan-steps` isn't the right skill for a `cleanup`. If this review doesn't settle it, [[Cleanup Plan-Steps Review]] asks it again.
- `split-checker` split [[Agent Instructions Audit]] into 29 stories by problem, each fixing one, rather than by workflow step. Sarah rejected it on 2026-10-06: single-problem stories are "the ad hoc shoving in problem that got us into this mess in the first place". The agent is written for features (Requirements, a Design Handoff, a hub with a Build Order), so it improvised for a cleanup. If this review doesn't settle it, ask the user where this question goes next.
