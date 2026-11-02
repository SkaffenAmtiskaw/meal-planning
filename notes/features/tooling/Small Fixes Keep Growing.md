---
type: workflow
confirmed: 2026-11-01
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

**The gap:** a small fix keeps gaining pieces as it moves from one skill to the next, until it's hard to follow why it's that big.

**What happened:** the design Sarah expected for [[One Source of Today]] was a small utility that takes a time zone from a cookie. Sessions kept adding to it: two Rules, a lint rule, a hook with separate server and browser values for an out-of-date cookie, and temporary lines to check it with. The hook came from a `/decide` answer, and the temporary lines from `/plan-steps`. The story got hard enough to follow that she dropped the cookie, then brought it back once she saw its real size: three small pieces and the swaps.

Sarah, 2026-11-01:
- "the amount of planning around what should be a really straightforward change makes me think I've made the wrong decision architecting it"
- "the solution keeps getting more and more complicated and I _don't_ understand why."

**What it reaches:** at least `/decide` and `/plan-steps`. `/architect`, `/shape` and `/investigate` now check whether a note needs a convention, and `filing-work` writes routed work as the problem, so the Rules and the lint rule are covered. The pieces later skills add aren't.

# Questions
