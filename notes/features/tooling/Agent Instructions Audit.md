---
type: hub
confirmed: 2026-10-06
---
# Where It Stands
Next: its child stories ^status

Split on 2026-10-06 into workflow-step reviews, one for each step of each note type's workflow except Feature's `/shape` step, which has five, plus AGENTS.md, the memory folder, Note Conventions with the Roadmap header, and Conventions Review. The scan's findings and the open Agent Workflow Changes items about each step moved into the review notes. Feature Shape Review, Shared Note Procedures Review, Writing Standard Reviewer, Scope-Router Review, Writing Standard Review, Feature Template Review, Feature Decide Review, Merging Routed Designs, Overly Prescriptive Instructions, Feature Assess Review, Feature Check-Drift Review, Feature Plan-Steps Review, Agents Miss the Writing Standard, Feature Implement Review, Writing Reviewer Misses Criteria, Writing Standard Lacks Sentence Clarity, Breaking Up Long Skill Files, Changes That Reach Other Notes, Implement Follow-Up Fixes, Feature Final-Review Review, Feature Close Review, Bug Shape Review, Bug Decide Review, Bug Investigate Review, Reviewer Misses Enforced Details, Bug Check-Drift Review, Bug Plan-Steps Review, Bug Implement Review, Bug Final-Review Review, Bug Close Review, Pattern Shape Review, Pattern Decide Review, Pattern Architect Review, Pattern Check-Drift Review, Pattern Plan-Steps Review, Pattern Implement Review, Pattern Final-Review Review, Pattern Close Review and Infra Shape Review are done, and the rest aren't done yet.

# Inbox

# Purpose
Check every agent instruction against the standard the `writing-standard` skill sets, slim it down to what an agent needs, and make it do what Sarah expects. Sarah, 2026-10-06: "I mostly expect this to be just like Docs Audit but for agent files. It audits them all and makes sure they conform to the standard set forth in What Makes a Good Doc."

[Sarah] Agents are starting to disregard their instructions, doing things like saving notes in `.scratch`. This is almost certainly a context problem - they have too many instructions. We need to go through the agent instructions and look for sections which can be slimmed down and still retain the information the agent needs. I also wonder if we need to evaluate whether certain skills are trying to do too much, and should be separated into separate skills that share rules between them.

Sarah decided 2026-10-06 that the audit also covers what the instructions make agents do, so a skill or agent that doesn't work the way she expects is in scope: "This audit is about making sure the agent instructions are written so an agent can read them, but they're ALSO about making sure they do what I expect them to do. So if I say they aren't working like I want that's in scope. If we need to split this story into a gazillion tiny stories to make the agents do what I want so be it."

The agent instructions are AGENTS.md, every skill in `.claude/skills/` with its supporting files, every agent in `.claude/agents/`, the hooks' header comments, the note templates in `notes/templates/`, Note Conventions, the Roadmap's "How this file works" section and its header lines, and Claude's memory folder (`MEMORY.md` and the memory files). `writing-standard` and `rule-placement` set the standard, so they're checked rather than reworked, apart from three additions: decision 1's split criterion as a section in the `keeping-sessions-lean` skill (Sarah decided 2026-10-06 to add it to this story), the rules for writing skills that move in from memory, and a case in `rule-placement` for a rule only one branch of a skill uses.

Two changes were settled before the scan:
- **A pass over `/infra-design` for repetitive or unnecessary work.** Sarah decided 2026-10-05 that infra stories skip `/plan-steps` and that `/infra-design` writes a Build Order into the Design instead, which makes its sessions longer. The pass goes through `.claude/skills/infra-design/SKILL.md` and the agents it calls, including the Build Order step, and cuts work that repeats itself or isn't needed.
- **Note Conventions loads on demand** (decision 2). It stops loading through `paths`: the `.claude/rules/note-conventions.md` symlink and its `paths` frontmatter go, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to it. Sarah decided 2026-10-06 to make it in this story.


Sarah, 2026-10-06: links, to a heading or a block ID, may turn out to be how many of these files handle drift and repetition, rather than copies.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# How Each Review Works
Each note under Child Stories reviews one step of one note type's workflow, such as Feature's `/shape` step, in the order of the table: each type's steps from start to finish, one type after another, then AGENTS.md, the memory folder, Note Conventions with the Roadmap header, and Conventions Review. `/tooling` works each one in a single session. They're workflow notes on purpose (Sarah's call, 2026-10-06), so a review that grows too big is split into smaller review notes, not spun off into a story.

**Split check.** Check the review's size after reading the files the step uses, and again each time a decision opens more work. If the session might not hold the whole review, suggest a split early, such as reviewing the skill now and its agents in a new note. Don't push on in a crowded session. A new note follows these same rules. Its Roadmap line goes right after the line of the note it was split from, so the reviews still work through the workflows in order (Sarah's call).

The review covers every file the step uses: its skill, and the agents, shared skills, hooks and templates that skill uses. For each file:
1. **Read it whole, as its agent would.** Before looking at Issues Found, read the file from start to finish and ask of each line whether an agent would do the wrong thing without it. Cut every line that fails: what an agent already knows, a case it would handle anyway, and anything another file already says, including a line that restates AGENTS.md or only points to it, since AGENTS.md loads into every session. Aim for the shortest file that still does the step's job. This comes first because a list of known issues anchors whoever works from it, and the rest of the file passes unread. [Sarah] Read it as a whole includes checking if it meets quality standards. You should never assume that the way the file is now is the way it should be going forwards, both on a macro and a micro level. The entire point of this story is that we *know* the notes have major issues. Nothing is should be considered written in stone.
2. **Context.** Find what loads more than the step needs, or could make an agent miss an instruction, and settle with the user how to fix it. Decision 1 says when a skill splits, and when a procedure becomes a shared-rule skill or a supporting file.
3. **Clarity.** Make what's left as clear and unambiguous as the `writing-standard` skill describes.
4. **Issues Found.** Check each issue the note lists against the file as it now stands. The list holds what the scan found, not a plan or the review's scope, and the user decides what changes.

**The writing review.** When a review sends a file to the `writing-reviewer` agent, it sends the whole file, not just the changed passages, since in this audit the whole file is under review.

**A file the step uses gets its full review in the first story that uses it, whether it's a skill, agent, shared skill, hook or template.** Each later story that uses it re-checks it: it has to meet the needs of every step reviewed so far and still meet the writing standard. If it can't, that's the signal to split it. AGENTS.md, the memory folder, and Note Conventions with the Roadmap header get their full reviews in their own stories after the workflows, but every story re-checks them for its step.

**A procedure several files share** is handled by the first review that reaches it, everywhere it appears. Later reviews use the result.

**Conventions.** Read the Conventions section before starting. When the user decides a convention, add an entry: the convention, this review and the need behind it. When an existing convention comes up, add a line under its entry with what this skill needed and whether the convention fit. If it conflicts, propose doing what the skill needs, confirm it with the user, and record why it conflicted. The convention itself is settled in [[Conventions Review]], at the end, once every case is in.

# Conventions
### Embed relevant detail rather than link to it
**Decided in:** planning these reviews, 2026-10-06. Sarah doesn't want to tab between notes to read relevant detail, so each review note embeds the decisions that apply to it instead of linking them.

### No procedure for a rare case that differs each time
**Decided in:** Feature Assess Review, 2026-10-15. Sarah dropped the retype workflow (`retyping-a-note` and each skill's "After a retype" line) because a retype is rare and its circumstances differ every time, so a prescribed procedure could cause problems. When such a case comes up, the agent asks the user how to handle it rather than stopping.

### A **short** rule several agents share stays a copy in each, unless drift would matter
**Decided in:** Feature Check-Drift Review, 2026-10-15. The read-only Bash line in `code-drift-checker`, `note-drift-checker` and `leftovers-checker` is kept word for word in each agent rather than in a shared-rule skill they preload, as `rule-placement` would place it, because a preloaded skill costs more context than the line, and copies that drift apart wouldn't change what the agents do. If drift between copies would really matter in a case, the rule goes in a shared-rule skill. Sarah's call: in most cases drift won't matter much.
- Feature Plan-Steps Review, 2026-10-15: `plan-checker`'s copy of `/plan-steps`' step rules had already drifted (its list of what counts as the approach left out bug and cleanup notes), and a checker working from a stale copy passes the mistakes it's there to catch, so drift mattered here: the rules moved to a new shared-rule skill, `writing-implementation-steps`, that `/plan-steps` loads and `plan-checker` preloads. `/infra-design`'s few lines on Sarah checks stay a copy, since loading the whole skill for them would cost more than it saves. The convention fit.
- Implement Follow-Up Fixes, 2026-10-18: `building-code/bugs.md` now hands a layout or timing bug to `bug-reproducer` the same way `/investigate` does, so that short hand-off is a copy in two skills.
- Bug Investigate Review, 2026-10-31: once `/investigate` reproduced and diagnosed a bug the way `bugs.md` does, the two shared the whole procedure, not just the hand-off, and their copies had already drifted apart once. It moved into `building-code/reproducing-a-bug.md`, which both read, since reading that file costs about what a copy would. The convention didn't fit, because it keeps a copy only where loading the shared rule costs more than the copy.
- Feature Close Review, 2026-10-31: `/close`'s done-close check keeps a short copy of `filing-work/content-from-another-note.md`'s rule that moved work comes along in full, with its image embeds and handoff text, since reading the file would cost more than the phrase. Where `/close` moves content itself, it reads that file, because only that branch needs the rule and the file then loads only there. The convention fit.
- Bug Plan-Steps Review, 2026-10-31: the rule for a hidden story `hidden-story-checker` finds (triage one that shares no design right away, and send the ones that share design to `split-checker`) is a short copy in both `/assess` and `/plan-steps`, rather than in `splitting-a-story`, which would then load on every run that finds a hidden story. Each copy is two short items, and drift between them would still put every hidden story in front of the user in triage. The convention fit.
- Bug Final-Review Review, 2026-10-31: `/final-review`'s check 3 now says what a note's approach is, a third copy of the line in `/plan-steps` and `hidden-story-checker`. It stays a copy, since copies that drift apart differ only in their "such as" examples, which doesn't change what an agent compares the code with. The convention fit.
- Pattern Architect Review, 2026-10-31: `/architect` and `/infra-design` keep their step 1 readiness checks as near-copies, since each is a few lines and drift between them would at worst cost the user one more question. The convention fit. Their copies of where a settled gap's answer goes, an exception to `settling-a-decision`'s Record section, had already drifted apart in wording, so that rule moved into `settling-a-decision`, which both already load at that point. The convention didn't fit, because the shared rule costs no extra load there.
- Pattern Check-Drift Review, 2026-10-31: `/check-drift` now re-audits a pattern's Rules with `rule-auditor`, so the rule to send the auditor only the Rules, not the note or its checklist, is a short copy in both `/check-drift` and `/architect`. Drift between them would still leave each sending only the Rules. The convention fit.
- Pattern Plan-Steps Review, 2026-11-01: the rule that a place breaking a pattern's Rules joins its Migration Checklist without asking is a short copy in `/check-drift` and `/plan-steps`. `/check-drift` leaves a callout for a later session, and `/plan-steps` names the place in the outline the user is about to review. Drift between them would still put the place on the checklist. The convention fit.
- Pattern Final-Review Review, 2026-11-01: `/check-drift`'s copy of that rule now leaves a violation another story's Migration Checklist lists, since an audit of a split pattern's child also finds its siblings' places. `/plan-steps`' copy doesn't need the case, because it adds only a place one of the story's own steps needs. The convention fit.

# Current State
Scanned 2026-10-06 by eleven read-only subagents, each reading its files in full against the `writing-standard` skill (SKILL.md and `instructions.md`) and `rule-placement`, and grepping `.claude/skills`, `.claude/agents`, AGENTS.md, `docs/` and the notes for each rule's other copies. Word counts are from `wc -w`. Line numbers are as of that day, so re-check them before planning. Sarah said 2026-10-06 that the findings go in unreviewed, and that the agent working on each piece after the split goes through them with her.

## Sizes
| Files | Words | Loads |
|---|---|---|
| AGENTS.md | 4,477, of which "Editing notes" is 1,656 and "Working with Sarah" 1,481 | every session and subagent |
| `MEMORY.md` | 1,368 | every session |
| The 11 agents' descriptions | about 470 | every session |
| Skills | `dependency-updates` 4,738, `/shape` 3,249, `/plan-steps` 3,100, `/implement` 2,674 plus 966 in the supporting files every run reads, `/close` 2,598, `/roadmap` 2,528, `/infra-design` 2,273, `/tooling` 2,211, `/check-drift` 2,170, `/investigate` 2,163, `/architect` 2,083, `/decide` 1,925, `/assess` 1,840, `/final-review` 1,661, `ci-failure` 1,526, `/kickoff` 1,165, `routine-sessions` 1,018 | when run |
| Agents | 8,509 in all; `scope-router` 1,312, `split-checker` 1,198, `plan-checker` 1,091 | when called |
| Templates | 5,051, of which 4,132 are comments | when a template is read |
| Note Conventions | 1,934; its Next Step table is 10.9 KB, about 5.3 KB of it padding | on demand after decision 2 |
| Memory files | 11,565 over 77 files | when recalled |

Each finding moved into the review note it belongs to on 2026-10-06.

# Child Stories
| Story | Scope |
|---|---|
| Feature Shape Review | Feature's `/shape` step; full review of `/shape`, the `notes-only-edits.sh` hook |
| Shared Note Procedures Review | Feature's `/shape` step; full review of `answer-confidence`, `roadmap-placement`, and the procedures for creating an idea note and deleting a note |
| Writing Standard Reviewer | a reviewer subagent that checks each draft of a doc or agent instruction against `writing-standard` before the user sees it |
| Scope-Router Review | Feature's `/shape` step; full review of the `scope-router` agent |
| Writing Standard Review | Feature's `/shape` step; full review of `writing-standard`, `rule-placement`, and a new `keeping-sessions-lean` skill |
| Feature Template Review | Feature's `/shape` step; full review of `notes/templates/Idea.md`, `notes/templates/Feature.md` and the comments the templates share |
| Feature Decide Review | Feature's `/decide` step; full review of `/decide`, the `decision-researcher` agent |
| Merging Routed Designs | a skill that fits design material that isn't for a single story into the stories it belongs to: a handoff that affects several stories, or design material routed into a feature story's Inbox |
| Overly Prescriptive Instructions | a check, in drafting or reviewing agent instructions, that catches an instruction fixed tighter than its task needs, and a rule that a change gets only the length and position its point earns |
| Feature Assess Review | Feature's `/assess` step; full review of `/assess`, the `split-checker` agent, the `note-drift-checker` agent, the `code-critic` agent, and a new `splitting-a-story` skill for the split walkthrough `/assess` and `/plan-steps` share |
| Feature Check-Drift Review | Feature's `/check-drift` step; full review of `/check-drift`, the `code-drift-checker` agent |
| Feature Plan-Steps Review | Feature's `/plan-steps` step; full review of `/plan-steps`, `running-the-app`, the `plan-checker` agent |
| Agents Miss the Writing Standard | why agents drafting or reviewing agent instructions keep missing the writing standard (too detailed, too prescriptive, keeping patterns that don't conform), and a fix that holds |
| Feature Implement Review | Feature's `/implement` step; full review of `/implement` (with `first-pass.md`, `bugs.md` and `cleanup.md`), the `protect-config.sh` hook, and a new `building-code` skill for the build procedure `/implement` and `/final-review` share |
| Writing Reviewer Misses Criteria | why the `writing-reviewer` agent reviews against only the criteria it thinks matter, and a fix that makes it review against the whole standard |
| Writing Standard Lacks Sentence Clarity | a rule in `writing-standard` for sentences a reader can follow on the first read, and the `writing-reviewer` pass that checks it |
| Breaking Up Long Skill Files | whether long skill files are broken into smaller ones each session loads whole, instead of agents reading one section by path |
| Changes That Reach Other Notes | a built change's effect on another story given an Inbox item without asking the user, rather than raised as out-of-scope work or inside a summary |
| Implement Follow-Up Fixes | the possible problems `writing-reviewer` test runs found in the shipped `/implement` and `building-code` text, which the first `/implement` review missed |
| Feature Final-Review Review | Feature's `/final-review` step; full review of `/final-review`, the `leftovers-checker` agent, the `target-designer` agent |
| Feature Close Review | Feature's `/close` step; full review of `/close` |
| Bug Shape Review | Bug's `/shape` step; full review of `notes/templates/Bug.md` |
| Bug Decide Review | Bug's `/decide` step |
| Bug Investigate Review | Bug's `/investigate` step; full review of `/investigate`, the `bug-reproducer` agent |
| Reviewer Misses Enforced Details | why `writing-reviewer` and drafting agents keep an exact detail that a hook, script or other rule already enforces, and a check that catches it |
| Bug Check-Drift Review | Bug's `/check-drift` step |
| Bug Plan-Steps Review | Bug's `/plan-steps` step; full review of a new `hidden-story-checker` agent, which takes the hidden-story test out of `split-checker` |
| Bug Implement Review | Bug's `/implement` step; a bug whose Root Cause turns out wrong goes back to `/investigate` |
| Bug Final-Review Review | Bug's `/final-review` step; check 3 names a bug's Fix as its approach |
| Bug Close Review | Bug's `/close` step; step 4 decides whether an unblocked story needs `/check-drift` from the reason it would, instead of from a list of status-line cases |
| Pattern Shape Review | Pattern's `/shape` step; full review of `notes/templates/Pattern.md`, whose comments go under decision 9 and whose Root Cause section goes, since no skill writes it and nothing downstream needs it |
| Pattern Decide Review | Pattern's `/decide` step |
| Pattern Architect Review | Pattern's `/architect` step; full review of `/architect` and `rule-auditor`: `/architect` settles a pattern's convention itself, a revision reworks only what called for it, the auditor no longer gets the Enforcement, and where a settled gap's answer goes moves into `settling-a-decision` |
| Pattern Check-Drift Review | Pattern's `/check-drift` step: `/check-drift` re-audits a pattern's Rules with `rule-auditor` and adds violations the Migration Checklist doesn't list |
| Pattern Plan-Steps Review | Pattern's `/plan-steps` step: Enforcement and doc checks, how a pattern's places and Docs items land in steps, a place missing from the Migration Checklist joins it without asking, and `split-checker` handles a pattern split with a hub that holds its Rules |
| Pattern Implement Review | Pattern's `/implement` step: a Rule that has to change sends the story back to `/architect`, step 5 confirms each Migration Checklist item the step took on, and `building-code` runs `pnpm lint:ci` when a change adds a lint rule |
| Pattern Final-Review Review | Pattern's `/final-review` step: check 1 checks a story against what it set out to do, `leftovers-checker` flags code that lost its last user because of the story, and `/check-drift` leaves a violation another story's Migration Checklist lists |
| Pattern Close Review | Pattern's `/close` step: a line citing content now in `docs/`, such as a done pattern's Rules, is a passing mention whose link is swapped for one to the doc section, with no keep-or-move question |
| Infra Shape Review | Infra's `/shape` step; full review of `notes/templates/Infra.md`, whose comments go under decision 9 |
| [[Infra Decide Review]] | Infra's `/decide` step |
| [[Infra Infra-Design Review]] | Infra's `/infra-design` step; full review of `/infra-design` |
| [[Infra Check-Drift Review]] | Infra's `/check-drift` step |
| [[Infra Implement Review]] | Infra's `/implement` step; full review of `/infra-build` (new, decision 8) |
| [[Infra Final-Review Review]] | Infra's `/final-review` step |
| [[Infra Close Review]] | Infra's `/close` step |
| [[Cleanup Shape Review]] | Cleanup's `/shape` step; full review of `notes/templates/Cleanup.md` |
| [[Cleanup Decide Review]] | Cleanup's `/decide` step |
| [[Cleanup Investigate Review]] | Cleanup's `/investigate` step; full review of `/audit` (new, decision 7) |
| [[Cleanup Check-Drift Review]] | Cleanup's `/check-drift` step |
| [[Cleanup Plan-Steps Review]] | Cleanup's `/plan-steps` step |
| [[Cleanup Implement Review]] | Cleanup's `/implement` step |
| [[Cleanup Final-Review Review]] | Cleanup's `/final-review` step |
| [[Cleanup Close Review]] | Cleanup's `/close` step |
| [[Sweep Kickoff Review]] | Sweep's `/kickoff` step; full review of `/kickoff`, `notes/templates/Sweep.md` |
| [[Sweep Check-Drift Review]] | Sweep's `/check-drift` step |
| [[Sweep Plan-Steps Review]] | Sweep's `/plan-steps` step |
| [[Sweep Implement Review]] | Sweep's `/implement` step |
| [[Sweep Final-Review Review]] | Sweep's `/final-review` step |
| [[Sweep Close Review]] | Sweep's `/close` step |
| [[Roundup Kickoff Review]] | Roundup's `/kickoff` step; full review of `notes/templates/Roundup.md` |
| [[Roundup Decide Review]] | Roundup's `/decide` step |
| [[Roundup Check-Drift Review]] | Roundup's `/check-drift` step |
| [[Roundup Plan-Steps Review]] | Roundup's `/plan-steps` step |
| [[Roundup Implement Review]] | Roundup's `/implement` step |
| [[Roundup Final-Review Review]] | Roundup's `/final-review` step |
| [[Roundup Close Review]] | Roundup's `/close` step |
| [[Hub Shape Review]] | Hub's `/shape` step; full review of `notes/templates/Hub.md` |
| [[Hub Decide Review]] | Hub's `/decide` step |
| [[Hub Close Review]] | Hub's `/close` step |
| [[Workflow Tooling Review]] | Workflow's `/tooling` step; full review of `/tooling`, `notes/templates/Workflow.md` |
| [[Large Workflow Changes]] | a path for a workflow change that isn't infra but is too big for one `/tooling` session |
| [[Goal Roadmap Review]] | Goal's `/roadmap` step; full review of `/roadmap`, `notes/templates/Goal.md` |
| [[Standing Goal Roadmap Review]] | Standing goal's `/roadmap` step; full review of `notes/templates/Standing Goal.md` |
| [[CI-Failure Review]] | the `ci-failure` routine; full review of `ci-failure`, `routine-sessions` |
| [[Dependency-Updates Review]] | the `dependency-updates` routine; full review of `dependency-updates` |
| [[AGENTS.md Review]] | AGENTS.md as a whole |
| [[Memory Folder Review]] | Claude's memory folder as a whole |
| [[Note Conventions and Roadmap Header Review]] | Note Conventions and the Roadmap's header, each as a whole |
| [[Conventions Review]] | the Conventions list below, once every case is in |

# Open Decisions
1. When should a skill be split into separate skills that share rules? ^decision-1
   - **Decided 2026-10-06:** A skill is split by mode when a run takes one of several paths chosen at its start, such as by the note's type, and the modes truly share little. Each mode becomes its own command, and steps both modes truly need are written into each. How much they truly share is judged skill by skill: for each step that looks shared, the scan asks whether every mode needs it as written, or whether one mode was fitted into steps written for another. A procedure more than one skill follows becomes a shared-rule skill, as `rule-placement` describes, and a branch that sits in one place in a run goes to a supporting file. A SKILL.md over about 5,000 tokens, or a variant woven through many of a skill's steps, is a smell: it gets a closer look, not a split on its own. Sarah's call: new commands cost her little, since the Roadmap says what to run on each story. Checked against the code and notes.
     - Rejected: never split, only move branches into supporting files - it leaves skills full of mode branches.
     - Rejected: split by length - a short skill doing several jobs would pass, so length is only a smell.
     - Rejected: keep one command per lifecycle step, with `/implement` handing an infra note to a variant skill - the variant could run without `/implement`'s checks and config hook, and Sarah doesn't need few commands.
2. Should Note Conventions stop loading whenever a session reads a file in `.claude/skills/` or `.claude/agents/`? ^decision-2
   - **Decided 2026-10-06:** Yes. Note Conventions moves out of `.claude/rules/` and loads on demand: a session that needs the map reads it, as `/tooling` and `/shape` already do, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to it. Reading a skill or agent file doesn't mean a session needs the map, so a read trigger loads it mostly where it isn't used, such as every `/implement` run.
     - Rejected: keep the `paths` trigger on `.claude/skills/**` and `.claude/agents/**` - it loads about 1,900 words into every `/implement` run, and makes decision 1's supporting files cost more context than they save.
     - Rejected: narrow `paths` to `.claude/skills/*/SKILL.md` and `.claude/agents/*.md` - reading another skill's SKILL.md still loads it into sessions that don't need it.

3. When does a **Decided** answer count as Sarah's call? ^decision-3
   - **Decided 2026-10-06:** Only when Sarah gives a reason of her own or says the choice matters to her. Picking from the options she was shown, such as to let a blocked story move, makes the choice only approved. Why: a past session recorded an answer this way when Sarah had only picked the option that looked best so a blocked story could move, and later agents then treated that choice as one she cared about. Sarah's call.
     - Rejected: ask each time whether it's her call - accurate, but adds a question to every decision.
4. What does `/final-review` check? ^decision-4
   - **Decided 2026-10-06:** In this order: (1) whether the built story does what its Purpose, and its Goals or Requirements, set out to do; (2) the code against best practice and the project's conventions, for every note type; (3) the code against the plan, where what Sarah said she wants specifically has to match, and what she only approved can be built differently, a difference being a finding only if (2) would flag it. For (2) and (3), an As built note that explains why the build goes against best practice, a convention or something she asked for is weighed: if the reason holds up it isn't a finding, and if the agent got it wrong it is. Sarah's call, from her line about `/final-review` and her changes to the draft. This replaces `final-review/SKILL.md:57`, which makes every difference from the approved Suggested Approach a finding, and `:59`, which checks other types only against their own Design, Conventions or Decided lines.
   - **Updated 2026-10-31:** a difference in what the app does or shows is always a finding, even from a part Sarah only approved, since AGENTS.md says what the app does is never an agent's to change. Only a difference in how the code is built is a finding just when (2) flags it.
   - **Updated 2026-11-01:** (1) checks the built story against what it set out to do, and the agent works out from the note what that is for its type. Sarah's call, in Pattern Final-Review Review: naming the sections for each type is too prescriptive.
     - Rejected: name the sections per type, with a bug checked against its Symptoms and Who Can Hit This (decided 2026-10-31, in Bug Final-Review Review) - an agent can tell this from the note.
5. Where does AGENTS.md's "Editing notes" live? ^decision-5
   - **Decided 2026-10-06:** In an `editing-notes` shared-rule skill that loads before a note in `notes/` is changed, like `writing-standard`. Skills that write notes name it at the step where they write. AGENTS.md keeps a pointer and the three rules any session could break: never edit or write in Sarah's lines, never reorder the Roadmap, and only `/check-drift` writes Check Drift callouts. The rules for reading embeds and links stay in AGENTS.md, since sessions that only read notes need them. The out-of-scope triage procedure moves to a shared-rule skill the same way, as `rule-placement` describes.
     - Rejected: keep it in AGENTS.md - about 1,400 words in every session and subagent, most of which never edit a note.
6. When are the places where a skill words a rule differently from where it's kept (exception or drift, as `rule-placement` describes) settled? ^decision-6
   - **Decided 2026-10-06:** During `/implement`, at the step that edits that file. Current State lists each with both wordings, and `/plan-steps` puts each in the step that edits its file. Sarah's call: the story will likely split into many smaller stories, and she can answer better with the file fresh.
     - Rejected: settle all of them in `/investigate` - about 30 questions, asked away from the files.
   - **Updated 2026-10-06:** with the split into one review per workflow step, each wording difference is settled in the review that edits its file, so the file is still fresh, as this decision intended.
7. How does `/investigate` split? ^decision-7
   - **Decided 2026-10-06:** `/investigate` keeps bug notes. A new `/audit` command takes a cleanup note to `spec`: it scans the code in the note's scope, settles with Sarah how to tidy it, and writes Current State and Open Decisions. The two modes share little: every reason in `/investigate`'s "why" section is about bugs, and its cleanup step borrows from the bug step.
8. How does `/implement` split? ^decision-8
   - **Decided 2026-10-06:** Infra moves out: a new `/infra-build` command builds an infra story's Build Order, with its own `protect-config.sh` hook. Infra is woven through nearly every step of `/implement` and follows a Build Order rather than `/plan-steps`' steps. The procedures both commands share (settling open choices, writing tests first, running the checks, cleanup, fixing a bug) move into shared-rule skills that `/final-review` also uses, instead of pointing into `/implement`'s SKILL.md.
   - **Still open:** whether sweep, roundup and cleanup each stay in `/implement`. Sarah decided 2026-10-15 that each type is judged in its own Implement review, with that type's step in view. Feature stays: Feature Implement Review rebuilt `/implement` around it, with the shared procedures in a `building-code` shared-rule skill that `/final-review` also uses.
   - **Decided 2026-10-31:** bug stays too. Bug Implement Review found that a bug's step takes the same path as a feature's, and every step on it does work a bug fix needs. The parts only features use check their own condition, such as a plan that cites a design, and the bug procedures are already in `building-code`.
   - **Decided 2026-11-01:** pattern stays too. Pattern Implement Review found that a pattern's step takes the same path as a feature's or a bug's, and needs only a few lines of its own.
9. What does a template comment hold? ^decision-9
   - **Decided 2026-10-14:** Nothing, unless it earns its place like any other line: a reader would get the section wrong without it, and nothing else tells them, such as the format a person or `filing-work` follows when adding a roundup issue. A rule an agent follows lives in its skill, agent or AGENTS.md, so the Done When item format moves to `/roadmap` and the hub's Coverage format moves to the skill that writes it. Body text that becomes part of the note, such as the Meta-Instructions blocks, isn't a comment and isn't covered by this. Sarah's call: a comment costs attention like any other line, and one copied into several templates has to be kept in sync.
     - Rejected: a one-line comment on each section the user fills in, saying what it's for, and "Written by `/<skill>`" on each section a skill writes (decided 2026-10-06) - most of those lines tell the reader nothing the heading doesn't.
10. What does a revision with `/infra-design` or `/architect` rework? ^decision-10
    - **Decided 2026-10-06:** Only what its trigger names, such as the Inbox item, the `^status` line or Sarah's answer. `/infra-design` still runs the Goals check, and every other section keeps its approval unless the rework changes it. Today a revision re-approves every section; Branching and Releases' revision would take about 55 approvals.
11. What does a Build Order's Implementer check say? ^decision-11
    - **Decided 2026-10-06:** Only what the Design doesn't: how a requirement or failure path gets checked, and what to do if it fails. `/infra-design` gives each Piece a block ID (` ^piece-N`), a step's **Builds:** line links its Pieces (`[[#^piece-7|Piece 7]]`), and a check about one Piece links it instead of restating it. The links are Sarah's call.
12. What does a Design's Flow cover? ^decision-12
    - **Decided 2026-10-06:** Only what no single Piece holds: what starts a run, the hand-offs between Pieces and failures that cross Pieces. It links each Piece it mentions.
13. What does `/tooling` do with a blank-type note in `notes/features/tooling/`? ^decision-13
    - **Decided 2026-10-06:** Treat it as story work and send it to `/shape`. The case that called it a pre-workflow note and asked whether it's a workflow note goes, since `/tooling`'s own spin-off now creates blank-type idea notes.
14. What is a hub for, and what does it show about its children? ^decision-14
    - **Decided 2026-10-06:** A hub holds shared design. It has no Build Order: a child that waits on another story says so in its own `blocked-by`, and the Roadmap decides order. Sarah's call: she reads the Roadmap for order and status, and hubs obscured it. The Child Stories table keeps Story and Scope, which `/close` and `/decide` use, and drops Status and Blocked by, which nothing reads. `/close` stops marking a child done or dropped in the hub's list. When `split-checker` or `/decide` creates a child, it embeds `![[<hub>#Purpose]]` in the child's Purpose, so the hub's Meta-Instructions reach whoever works on the child (Sarah's call). The Hub template keeps its Meta-Instructions. The four existing hubs stay as they are (Sarah's call: notes join this story only when one can't move through its workflow, and `/close` still works on them).
15. What does `dependency-updates` do when a check fails only on GitHub? ^decision-15
    - **Decided 2026-10-06:** What it does today, moved to a supporting file the skill reads only when a check passes locally but fails on GitHub. `rule-placement` gets the case behind it: a rule only one branch of a skill's run needs goes in a supporting file the skill reads where that branch starts. Sarah's call: edge-case workflows are kept but loaded only when needed.
      - Rejected: re-run once, then report and leave the pull request for Sarah - the pull request would stay red until she looks.
16. Where do the Feature template's Meta-Instructions live? ^decision-16
    - **Decided 2026-10-06:** They stay in the template, word for word, moved from under `# Out of Scope` to under `# Design Handoff`. Sarah's call: they're clearer than any skill's line, and they reach every skill and agent that reads a handoff.
      - Rejected: move them into the skills - seven skills and four agents read handoffs, and the skills' lines say less.
17. What do instructions call the person they work with? ^decision-17
    - **Decided 2026-10-14:** "The user", wherever an instruction means whoever is running the session. Where an agent records that the user made a call, it writes that user's name, as in "Sarah decided …" and "Sarah's call", and an instruction recognizes a user's own lines by a tag or signature with their name, such as `[Sarah]`. Sarah's call: she doesn't want a hypothetical user called by her name, and since the user might in theory be someone else, the notes should record which user made each call.
      - Rejected: instructions keep Sarah's name where agents record a call and in the tags they look for (decided 2026-10-06) - it ties those records to one user.


# Out of Scope
- The docs in `docs/` and `README.md`: [[Docs Audit]], apart from the rule from the `repo-installs-its-tools` memory, which goes into `docs/ci.md`.
- Story notes in `notes/`, apart from updating their references to a skill this story splits or renames, and the four collecting notes' What Belongs Here. The four existing hubs stay as they are (decision 14).


# Deferred Work
