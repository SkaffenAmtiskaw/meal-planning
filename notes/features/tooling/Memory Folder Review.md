---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Full review here:** the memory folder (`MEMORY.md` and the memory files). Every workflow review before this one re-checked it for its own step; this review looks at it as a whole, knowing every step's needs.

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.

All 77 memories were read in full on 2026-10-06, and checked-in files were grepped for each one's rule. Deleting a memory whose rule is checked in follows the Memory rule in AGENTS.md's "Git and Files".
- **Delete, rule already checked in:** `agents-adapt-to-process`, `as-built-covers-review-gaps`, `blocked-by-summary-not-per-decision`, `confirm-before-logging-process-feedback`, `convention-violations-are-tech-debt`, `delete-unreferenced-vault-files`, `designs-mostly-not-pixel-perfect`, `hubs-close-like-stories`, `move-story-to-now-when-started`, `named-home-skips-scope-router`, `new-roadmap-lines-start-in-ideas`, `new-session-per-note`, `no-rules-for-hypothetical-cases`, `one-question-at-a-time`, `plan-outline-check-summary`, `preserve-design-refs-when-moving-work`, `prompt-doc-updates-immediately`, `recommend-on-best-practice-not-taste`, `records-belong-in-docs`, `roadmap-spot-suggestions`, `roadmap-status-only`, `scratch-is-session-only`, `self-contained-questions`, `shape-reads-note-conventions`, `skill-invocation-confirms-relevance`, `skip-obvious-outline-confirmations`, `split-stories-design-in-hub`, `status-line-says-where-not-what`, `step-plan-standards`, `story-ready-definition`, `tooling-enforcement-is-docs`, `tooling-stays-general-on-roadmap`, `tooling-summary-table`, `work-the-kicked-off-copy`.
- **Delete, stale:** `migration-skills-skip-note-workflow` (names `/workflow` and `/review`), `moving-out-of-scope-work` (new lines go straight to the Roadmap; smells go to a `cleanup` note) and `next-is-for-active-goals` (two goals share Next).
- **Move, then delete:** `repo-installs-its-tools` (to `docs/ci.md`, pulled in).
- **Keep:** `add-an-idea-means-a-note`, `ask-approval-not-staging` and `sarah-reviews-in-ide` (merge into one, without the history line), `ask-sarah-facts-about-her-setup`, `check-docs-before-saying-undocumented`, `clear-choice-questions`, `convention-means-industry-standard`, `describe-what-is-not-what-isnt` (notes and templates only, since `writing-standard` holds the rule for docs and instructions; Sarah decided 2026-10-14 to keep it for them), `dismissed-question-means-aside`, `dont-cite-no-verify`, `finish-cleanup-before-commit`, `mechanical-edits-skip-approval` (a stop-gap until its Agent Workflow Changes item lands; it says AGENTS.md forces approval of link rewording, though AGENTS.md:17 already lets a link swap through, so only `shape:107` forces it), `no-agile-vocabulary`, `no-feelings-management` (without its history line), `no-reason-to-pull-work-from-goal` (Sarah decided 2026-10-06 it stays as a memory and isn't written into the goal note), `point-out-wrong-premises`, `priority-questions-mean-rethink`, `recheck-means-real-issues-only`, `roadmap-is-the-view`, `sarah-names-are-placeholders`, `tech-debt-means-app-health`.

Where each memory to delete already has its rule, as of 2026-10-06. Some of these lines move or go in the earlier reviews, so check that the rule still lives somewhere before deleting the memory:

| Memory | Rule kept at |
|---|---|
| `agents-adapt-to-process` | AGENTS.md:21-22, `tooling:15` |
| `as-built-covers-review-gaps` | `implement/SKILL.md:29` |
| `blocked-by-summary-not-per-decision` | Note Conventions:15, `shape:147`, `decide:36` |
| `confirm-before-logging-process-feedback` | AGENTS.md "Out-of-scope work", `triaging-out-of-scope-work` |
| `convention-violations-are-tech-debt` | `notes/goals/App Health.md:13`, `notes/goals/Dev Tooling.md:16` |
| `delete-unreferenced-vault-files` | `close:24,113-116`, `tooling:93`, AGENTS.md:151 |
| `designs-mostly-not-pixel-perfect` | `building-code/design-comparison.md:2-9`, `building-code/SKILL.md:14-17` |
| `hubs-close-like-stories` | `close:22` |
| `move-story-to-now-when-started` | `implement:41`, `roadmap-placement` |
| `named-home-skips-scope-router` | `triaging-out-of-scope-work` |
| `new-roadmap-lines-start-in-ideas` | `roadmap-placement` "Placing a New Line", Roadmap:15, `tooling:46-48`, `roadmap-placement:15` |
| `new-session-per-note` | `shape:100`, `plan-steps:14`, `decide:137`, `close:25`, `implement:161`, `tooling:50` |
| `no-rules-for-hypothetical-cases` | `infra-design:52`, `architect:41` |
| `one-question-at-a-time` | `~/repos/CLAUDE.md` |
| `plan-outline-check-summary` | `plan-steps` step 4 |
| `preserve-design-refs-when-moving-work` | `filing-work/content-from-another-note.md`, `close:36` |
| `prompt-doc-updates-immediately` | AGENTS.md:33-39 |
| `recommend-on-best-practice-not-taste` | AGENTS.md:32, `decision-researcher:35,57`, `decide:72` |
| `records-belong-in-docs` | `close:20`, `tooling:86` |
| `roadmap-spot-suggestions` | `roadmap-placement` |
| `roadmap-status-only`, `status-line-says-where-not-what` | `editing-notes`, Roadmap:25 |
| `scratch-is-session-only` | AGENTS.md:118 |
| `self-contained-questions` | AGENTS.md:11 |
| `shape-reads-note-conventions` | `shape:28` |
| `skill-invocation-confirms-relevance` | `shape:43`, Note Conventions:16, `roadmap-placement` |
| `skip-obvious-outline-confirmations` | `plan-steps` step 4 |
| `split-stories-design-in-hub` | `split-checker:18`, `filing-work/content-from-another-note.md` |
| `step-plan-standards` | `writing-implementation-steps` "One Idea per Step" and "Something to See in Every Step" |
| `story-ready-definition` | Note Conventions:21-22 |
| `tooling-enforcement-is-docs` | `infra-design:54` |
| `tooling-stays-general-on-roadmap` | Roadmap:14, `roadmap-placement:10`, `roadmap:49,73-76` |
| `tooling-summary-table` | AGENTS.md "Summaries" |
| `work-the-kicked-off-copy` | `tooling:21` |
| `migration-skills-skip-note-workflow` (stale) | `tooling:3,10-13`, Note Conventions:37 |
| `moving-out-of-scope-work` (stale) | `filing-work`, `triaging-out-of-scope-work` |
| `next-is-for-active-goals` (stale) | Roadmap:6-21 |

- **The `repo-installs-its-tools` rule:** `docs/ci.md:13-20` covers CI and cloud tools installed from `mise.toml`, but not tools the hooks and scripts need on the user's machine. The rule goes into `docs/ci.md`, the one exception to leaving `docs/` to Docs Audit, and the memory is deleted.

# Questions
