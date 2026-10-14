---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `notes/templates/Idea.md`, `notes/templates/Feature.md`. This review reads each one as Feature's `/shape` step uses it, as the idea note `/shape` starts from and the feature note it drafts. It has to give that step what it needs and meet the writing standard. Later reviews re-check it for their own steps. The comments the templates share are reviewed here too, since `Feature.md` is the first template to carry them.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-16]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Templates' shared comments:** Where It Stands (Bug, Cleanup, Feature, Infra, Pattern :9, 151 words each) restates AGENTS.md, and its "or in the Inbox" contradicts AGENTS.md's Inbox rule. Inbox (8 templates, 75 words each) leaves out the rule for the user's own lines. Open Decisions (5 templates) defines the section more narrowly than `/shape:60-62`. Decision 9 sets what the comments hold.
- **`Feature.md`:** :39 (Suggested Approach's "reuse vs. build new") describes an older `/assess`; :42 sizes steps as "small enough to review" where `/plan-steps` uses one idea per step; :42 also sets status, repeating the skills and Note Conventions.
- **`Feature.md`:** Meta-Instructions moves under `# Design Handoff` (decision 16).
- **`Idea.md`:** :6 implies the user retypes the idea by hand; `/shape` does that.
- Wording difference at the Out of Scope comment in `Feature.md:27`: "each item should also be on the Roadmap". Where the rule is kept: AGENTS.md "Out-of-scope work" routes items to a note, a sweep, a roundup or a Roadmap line, or drops them. Exception or drift?
- Wording difference at `Idea.md:10`: no Inbox and no summary under the status line. Where the rule is kept: AGENTS.md says every story and hub has both. Exception or drift?

# Questions
