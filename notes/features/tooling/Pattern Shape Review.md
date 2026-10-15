---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Pattern's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `notes/templates/Pattern.md`.

**Re-checks for this step:** `/shape`, the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `settling-a-decision` (reviewed in [[Feature Decide Review]]); `roadmap-placement`, `deleting-a-note` (reviewed in Shared Note Procedures Review); the `scope-router` agent and `filing-work` (reviewed in Scope-Router Review); `notes/templates/Idea.md` (reviewed in Feature Template Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- `Pattern.md:35` (Enforcement "Required.", and a list unlike `architect:66-73`'s, including "an agent instruction") contradicts the skill that writes the section; `:44` sizes steps as "small enough to review" where `/plan-steps` uses one idea per step.
- `Pattern.md:31,44` set status and `:18` says to use another template, repeating the skills and Note Conventions.
- Wording difference at the Out of Scope comment in `Pattern.md:41`: "related problems found along the way". Where the rule is kept: AGENTS.md "Out-of-scope work" routes items to a note, a sweep, a roundup or a Roadmap line, or drops them. Exception or drift?

Moved from Agent Workflow Changes on 2026-10-06:
- **No skill writes a pattern note's Root Cause** - the Pattern template (`notes/templates/Pattern.md:24-25`) has a `# Root Cause` section ("Why the current code produces the symptoms, or why the lack of a convention is a problem"), but no skill writes it. `/shape` leaves it empty as a later step's section (`.claude/skills/shape/SKILL.md:146`), and `/architect` reads it as a source for the Rules (`.claude/skills/architect/SKILL.md:42`) but never writes it. Of the 8 pattern notes in `notes/features/tech debt/`, 3 have real content there (Server-Only Code Behind Barrels, Unit Testing - New Centralized Mocks, Calendar and Recipes Data Refresh) and 5 leave it empty, so a pattern reaches `/architect` with no root cause unless someone happened to write one. Decide with Sarah: drop the section from the template, or have a skill (`/shape` or `/architect`) write it, and if so how an agent works out a root cause. Sarah: "I can't speak to why some of these things happened. Agents wrote them and there was nothing to prevent it. So I'd need to think about it before I could articulate how an agent should figure out a root cause when I don't even really know it." Found 2026-10-06 during `/investigate` on [[Agent Instructions Audit]].

# Questions
