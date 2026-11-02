---
type: workflow
confirmed: 2026-11-01
---
# Where It Stands
Next: /tooling ^status

# Inbox
- From `/plan-steps` on [[One Source of Today]] on 2026-11-01: the design Sarah expected was a small utility that takes a time zone from a cookie. Sessions kept adding to it: two Rules, a lint rule, a hook with separate server and browser values for an out-of-date cookie, and temporary lines to check it with. The story got hard enough to follow that she dropped the cookie, then brought it back once she saw its real size: three small pieces and the swaps. Sarah: "the amount of planning around what should be a really straightforward change makes me think I've made the wrong decision architecting it", and "the solution keeps getting more and more complicated and I _don't_ understand why."

# Notes
Part of [[Agent Instructions Audit]].

**The gap:** `/architect`'s step 3 says what each rule has (one convention, a check, examples, where it lands), but doesn't push the agent to ask what actually has to be true.

**What happened:** drafting the Rules for [[One Source of Today]] on 2026-11-01, the first draft had 8 Rules. Most described how one small module works, which gets written once, so later code can't drift from those details. They were cut to 2, and the rest moved to the Migration Checklist's Infrastructure group. Rule 1 also said how components reach the value, then listed the allowed ways, when all that needed to be true was the source of truth.

Sarah, 2026-11-01:
- "this is a _lot_ of rules for what seemed like a straightforward change"
- "The rule needs to be about the source of truth not the exact mechanism with which a component gets it."
- "Sometimes the rule might be the mechanism, it just wasn't in this particular case. I think the broader issue is that the agent isn't thinking narrowly enough about what NEEDS to be true."

**What it reaches:** `.claude/skills/architect/SKILL.md` step 3.

# Questions
