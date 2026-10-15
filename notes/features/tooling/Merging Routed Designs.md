---
type: workflow
confirmed: 2026-10-14
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

**The gap:** the `filing-work` skill puts design material routed into an existing story's note, such as part of another story's design handoff, in that note's Inbox, and no step merges it into the story's design. Sarah, 2026-10-14: "I actually think if design material needs to be sent the story needs to go to a different step for a re-design (or a design merging). So it can go in the inbox for now but we probably need a skill specifically for handling that (rare) circumstance." She expects it to come up only in feature stories.

**Design handoffs:** nothing moves a feature from `idea` to `spec` once its design exists. After the Claude Design session, the note stays at `idea` unless someone sets `spec` by hand, and `/assess` stops on a feature that isn't at `spec` (`.claude/skills/assess/SKILL.md:28`). Found 2026-10-14 while reviewing the Feature template, whose Requirements comment was the only text that mentioned the move, and template comments never reach a real note. Sarah, 2026-10-14: "I'd honestly prefer to create a skill that takes a design handoff and puts it in the appropriate notes. Sometimes I get design handoffs that will affect multiple stories. It might actually have substantial overlap with the merging routed designs story. Both of them deal with making designs that aren't for a single story fit the story."

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

[Sarah] - It's very possible this skill might be run before I know which note it applies to. I might get a handoff from an agent and need the skill to figure out which notes it should go in. Likewise I might have a note which had a design but we opted to not complete the entire design in that story, and we need to figure out which notes the rest of the design is completed on.
# Questions
