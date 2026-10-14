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

All 77 memories were read in full on 2026-10-06, and checked-in files were grepped for each one's rule. Deleting a memory whose rule is checked in follows Sarah's policy in `docs-updates-note-scope`.
- **Delete, rule already checked in:** `agents-adapt-to-process`, `as-built-covers-review-gaps`, `batch-small-test-cleanups` (its leftover, "write a single obvious follow-on action into the item rather than calling it a decision", goes to `scope-router`'s Sweep case), `blocked-by-summary-not-per-decision`, `confirm-before-logging-process-feedback`, `convention-violations-are-tech-debt`, `delete-unreferenced-vault-files`, `designs-mostly-not-pixel-perfect`, `free-form-sections-sarah-edits`, `hubs-close-like-stories`, `leave-other-sessions-notes-alone`, `move-story-to-now-when-started`, `named-home-skips-scope-router`, `new-roadmap-lines-start-in-ideas`, `new-session-per-note`, `no-rules-for-hypothetical-cases`, `one-question-at-a-time`, `plan-outline-check-summary`, `preserve-design-refs-when-moving-work`, `prompt-doc-updates-immediately`, `recommend-on-best-practice-not-taste`, `records-belong-in-docs`, `reproduce-bugs-before-diagnosing`, `roadmap-spot-suggestions`, `roadmap-status-only`, `scratch-is-session-only`, `self-contained-questions`, `shape-reads-note-conventions`, `skill-invocation-confirms-relevance`, `skip-obvious-outline-confirmations`, `split-stories-design-in-hub`, `status-line-says-where-not-what`, `step-plan-standards`, `stop-servers-you-start`, `story-ready-definition`, `tooling-enforcement-is-docs`, `tooling-stays-general-on-roadmap`, `tooling-summary-table`, `work-the-kicked-off-copy`.
- **Delete, stale:** `migration-skills-skip-note-workflow` (names `/workflow` and `/review`), `moving-out-of-scope-work` (new lines go straight to the Roadmap; smells go to a `cleanup` note), `next-is-for-active-goals` (two goals share Next), and `docs-updates-note-scope` once its memory policy is in AGENTS.md.
- **Move, then delete:** `lean-skill-context`, `fix-judgment-not-add-approvals` (to `writing-standard`, in [[Writing Standard Review]]); `ask-about-unexpected-changes-when-committing`, `scratch-files-not-for-sarah`, `update-notes-when-touched`, `dont-flag-reversed-build-decisions` (to AGENTS.md, in [[AGENTS.md Review]]); `block-on-unbuilt-skills` and `remove-without-tombstones` (to `editing-notes`, in [[AGENTS.md Review]]); `general-mechanism-over-one-case` (to `scope-router`'s workflow-note case, in [[Scope-Router Review]], saying it applies to workflow features, unlike pattern Rules); `note-conventions-is-a-map` (to `/tooling` step 3, in [[Workflow Tooling Review]]); `trust-mantine-defaults` (to `/plan-steps`, in [[Feature Plan-Steps Review]]); `repo-installs-its-tools` (to `docs/ci.md`, pulled in).
- **Keep:** `add-an-idea-means-a-note`, `apply-conventions-by-intent` (its example halves), `ask-approval-not-staging` and `sarah-reviews-in-ide` (merge into one, without the history line), `ask-sarah-facts-about-her-setup`, `check-docs-before-saying-undocumented`, `clear-choice-questions`, `convention-means-industry-standard`, `describe-what-is-not-what-isnt`, `dismissed-question-means-aside`, `dont-cite-no-verify`, `finish-cleanup-before-commit`, `mechanical-edits-skip-approval` (a stop-gap until its Agent Workflow Changes item lands; it says AGENTS.md forces approval of link rewording, though AGENTS.md:17 already lets a link swap through, so only `shape:107` forces it), `no-agile-vocabulary`, `no-feelings-management` (without its history line), `no-reason-to-pull-work-from-goal` (Sarah decided 2026-10-06 it stays as a memory and isn't written into the goal note), `point-out-wrong-premises`, `priority-questions-mean-rethink`, `recheck-means-real-issues-only`, `roadmap-is-the-view`, `sarah-names-are-placeholders`, `tech-debt-means-app-health`.

Where each memory to delete already has its rule, as of 2026-10-06. Some of these lines move or go in the earlier reviews, so check that the rule still lives somewhere before deleting the memory:

| Memory | Rule kept at |
|---|---|
| `agents-adapt-to-process` | AGENTS.md:21-22, `tooling:15` |
| `as-built-covers-review-gaps` | `implement/SKILL.md:135-136` |
| `batch-small-test-cleanups` | `Sweep.md:21`, `check-drift:72,75`, `scope-router:24-27,39`, `kickoff:42-43`, Roadmap:26 |
| `blocked-by-summary-not-per-decision` | Note Conventions:15, `shape:147`, `decide:36`, `kickoff:51` |
| `confirm-before-logging-process-feedback` | AGENTS.md:94, :106-109 |
| `convention-violations-are-tech-debt` | `notes/goals/App Health.md:13`, `notes/goals/Dev Tooling.md:16` |
| `delete-unreferenced-vault-files` | `close:24,113-116`, `tooling:93`, AGENTS.md:151 |
| `designs-mostly-not-pixel-perfect` | `implement/first-pass.md:40-44`, `implement/SKILL.md:75` |
| `free-form-sections-sarah-edits` | `roadmap:30` |
| `hubs-close-like-stories` | `close:22` |
| `leave-other-sessions-notes-alone` | AGENTS.md:49 |
| `move-story-to-now-when-started` | `implement:41`, AGENTS.md:83 |
| `named-home-skips-scope-router` | AGENTS.md:108 |
| `new-roadmap-lines-start-in-ideas` | `scope-router:35`, Roadmap:15, `tooling:46-48`, `roadmap-placement:15` |
| `new-session-per-note` | `shape:100`, `plan-steps:143`, `decide:137`, `close:25`, `kickoff:73`, `implement:161`, `tooling:50` |
| `no-rules-for-hypothetical-cases` | `infra-design:66`, `architect:56` |
| `one-question-at-a-time` | AGENTS.md:9 |
| `plan-outline-check-summary` | `plan-steps:151` |
| `preserve-design-refs-when-moving-work` | `scope-router:41`, `close:36` |
| `prompt-doc-updates-immediately` | AGENTS.md:33-39 |
| `recommend-on-best-practice-not-taste` | AGENTS.md:32, `decision-researcher:35,57`, `decide:72` |
| `records-belong-in-docs` | `close:20`, `tooling:86` |
| `reproduce-bugs-before-diagnosing` | `investigate:20,57,63,104` |
| `roadmap-spot-suggestions` | AGENTS.md:76 |
| `roadmap-status-only`, `status-line-says-where-not-what` | AGENTS.md:54-61, Roadmap:25 |
| `scratch-is-session-only` | AGENTS.md:118 |
| `self-contained-questions` | AGENTS.md:11 |
| `shape-reads-note-conventions` | `shape:28` |
| `skill-invocation-confirms-relevance` | `shape:43`, Note Conventions:16, AGENTS.md:78 |
| `skip-obvious-outline-confirmations` | `plan-steps:151` |
| `split-stories-design-in-hub` | `split-checker:37`, `Hub.md:22`, `scope-router:22` |
| `step-plan-standards` | `plan-steps:50-53`, `plan-checker:21-30` |
| `stop-servers-you-start` | `running-the-app:13` |
| `story-ready-definition` | Note Conventions:21-22 |
| `tooling-enforcement-is-docs` | `infra-design:21` |
| `tooling-stays-general-on-roadmap` | Roadmap:14, `roadmap-placement:10`, `roadmap:49,73-76` |
| `tooling-summary-table` | `tooling:74,96` |
| `work-the-kicked-off-copy` | `tooling:21` |
| `migration-skills-skip-note-workflow` (stale) | `tooling:3,10-13`, Note Conventions:37 |
| `moving-out-of-scope-work` (stale) | `scope-router:21-23,27,35-37`, AGENTS.md:85 |
| `next-is-for-active-goals` (stale) | Roadmap:6-21 |

- **The `repo-installs-its-tools` rule:** `docs/ci.md:13-20` covers CI and cloud tools installed from `mise.toml`, but not tools the hooks and scripts need on the user's machine. The rule goes into `docs/ci.md`, the one exception to leaving `docs/` to Docs Audit, and the memory is deleted.

# Questions
