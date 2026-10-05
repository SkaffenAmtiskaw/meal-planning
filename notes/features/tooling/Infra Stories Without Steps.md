---
type: 
status: idea
confirmed: 2026-10-05
---
# Where It Stands
Next: /shape ^status

# Notes
Sarah wonders whether `/plan-steps` is inappropriate for `infra` stories. It's built for small incremental work, which she does want for feature work, where she reviews the code to make sure it matches what she expects. For infra, such as wiring up a GitHub Actions routine, she just wants it to work.

`/infra-design` already writes Goals that could serve as the end checks. Steps do other jobs that would need a home, though: they split a big design into session-sized pieces, give a session a place to stop and resume, and say when Sarah does each piece of Setup Outside the Repo.

It's a story because it's too big for one `/tooling` session: it needs decisions on what replaces steps for infra, and it reaches Note Conventions, `/infra-design`, `/plan-steps`, `/implement`, `/check-drift`, `/final-review` and the infra template.

# Questions
