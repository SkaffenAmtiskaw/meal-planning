---
type: workflow
confirmed: 2026-10-18
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

Sarah, 2026-10-18: "Maybe long skill files should be broken up."

**Found in Writing Reviewer Misses Criteria.** When a skill or agent needs only part of a shared file, the rules have it read just that part:
- `keeping-sessions-lean`'s "What a Skill Reads" says to point to the section it needs "if it needs only part of a long shared file".
- `rule-placement`'s "Referring to a Rule Kept Elsewhere" now sends an agent that needs only part of a shared-rule skill to that section.

In practice, `plan-checker` reads only "Which User to Sign In As" from the `running-the-app` skill, which is 336 words, so the rules' "long" doesn't match what agents do. Breaking a long skill into smaller files, each loaded whole by the sessions that need it, would replace reading a section by path.

[[Agent Instructions Audit]]'s decision 1 bears on this: it rejected splitting a skill by length, because a short skill doing several jobs would pass, so length is only a smell. [Sarah] - I rejected breaking up skill files on length alone, but if another skill or agent only needs part of a shared skill, that _does_ seem like a good reason to break it up. This story should either break up shared skills when another skill or agent only needs part of it, or if that is not practical for some reason we need to find a way to structure shared skills so it's extremely easy to only grab the part of a shared skill an agent needs (possibly the heading?)

# Questions
