---
type: workflow
confirmed: 2026-11-02
---
# Where It Stands
Next: /tooling ^status

Shaped 2026-11-02: retire the roundup type, and add a shorter path for small stories.

# Notes
Sarah, 2026-11-02, while deciding when each kind of collecting note joins a release: "Maybe we need to abandon the idea of roundups and let them be stories, albeit small ones. If we need to we could even make a small story workflow that skips some of the steps."

Sarah, the same day, on why it matters: "my main concern is that these types of notes will never be prioritized, because they are not a natural fit for most goals. So if we decide a certain type of collecting note doesn't get picked up in every release we need to have a time when it does get kicked off."

Sarah, the same day, on what small stories are: "They're still stories. They just don't necessarily need to have a detailed plan before they're implemented. They should be quick one-offs with a single decision."

An agent's read of what this reaches, from 2026-11-02:
- **[[Style Decisions]]** is the only roundup, with 6 open questions.
- **Skills and agents with roundup paths:** `/kickoff`, `/decide`, `/roadmap`, `roadmap-placement`, `filing-work`, `/check-drift`, `/close`, `writing-implementation-steps` and `scope-router`.
- **Other files with roundup text:** `scripts/vault-lint.sh`, AGENTS.md, Note Conventions, the Roadmap's "How this file works", and the Roundup, Sweep and Standing Goal templates.
- **Work this affects.** The Roundup reviews in Next, from [[Roundup Kickoff Review]] to [[Roundup Close Review]], review the type this removes. [[Sweep Kickoff Review]] does the full review of `/kickoff`, which holds the roundup paths. So this line sits ahead of them.
- **A possible overlap.** [[Large Workflow Changes]] covers workflow changes that are too big for `/tooling` and fit no story type, which may touch the same small-story path.

# Questions
1. Should the roundup type be retired, or kept with only its pickup gap fixed?
   - **Decided 2026-11-02:** Retire the roundup type; its issues become small stories. Sarah's call.
     - Rejected: keep the type and fix only its pickup gap
2. When do small stories that need a decision and fit no goal get picked up?
   - **Decided 2026-11-02:** Like any other story. If a goal they belong on is prioritized, they get worked as part of that goal, and if none ever is, they stay in the backlog like any other story. Sarah's call.
     - Rejected: join every release
     - Rejected: choose which join at each release
3. Should small stories get a shorter path that skips some steps, or use the existing lifecycle?
   - **Decided 2026-11-02:** Build a shorter path that skips some steps for small stories. Sarah's call.
     - Rejected: the existing lifecycle
4. Which type should this note be?
   - **Decided 2026-11-02:** A workflow note, made by `/tooling` in one session.
     - Rejected: an infra story
     - Rejected: a cleanup
