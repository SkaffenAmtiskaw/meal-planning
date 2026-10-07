---
type: cleanup
status: spec
blocked-by: []
confirmed: 2026-10-06
---
# Where It Stands
Investigated. Next: /plan-steps ^status

Shaped, decided and investigated 2026-10-06. The scan of every agent instruction is in Current State, and the decisions it raised, including the split of `/investigate` and `/implement`, are in Open Decisions. Planning is next, and the story is expected to split into several stories.

# Inbox

# Purpose
Check every agent instruction against the standard the `writing-standard` skill sets, slim it down to what an agent needs, and make it do what Sarah expects. Sarah, 2026-10-06: "I mostly expect this to be just like Docs Audit but for agent files. It audits them all and makes sure they conform to the standard set forth in What Makes a Good Doc."

[Sarah] Agents are starting to disregard their instructions, doing things like saving notes in `.scratch`. This is almost certainly a context problem - they have too many instructions. We need to go through the agent instructions and look for sections which can be slimmed down and still retain the information the agent needs. I also wonder if we need to evaluate whether certain skills are trying to do too much, and should be separated into separate skills that share rules between them.

Sarah decided 2026-10-06 that the audit also covers what the instructions make agents do, so a skill or agent that doesn't work the way she expects is in scope: "This audit is about making sure the agent instructions are written so an agent can read them, but they're ALSO about making sure they do what I expect them to do. So if I say they aren't working like I want that's in scope. If we need to split this story into a gazillion tiny stories to make the agents do what I want so be it."

The agent instructions are AGENTS.md, every skill in `.claude/skills/` with its supporting files, every agent in `.claude/agents/`, the hooks' header comments, the note templates in `notes/templates/`, Note Conventions, the Roadmap's "How this file works" section and its header lines, and Claude's memory folder (`MEMORY.md` and the memory files). `writing-standard` and `rule-placement` set the standard, so they're checked rather than reworked, apart from three additions: decision 1's split criterion as a new section in `writing-standard`'s `instructions.md` (Sarah decided 2026-10-06 to add it to this story), the rules for writing skills that move in from memory, and a case in `rule-placement` for a rule only one branch of a skill uses.

Two changes were settled before the scan:
- **A pass over `/infra-design` for repetitive or unnecessary work.** Sarah decided 2026-10-05 that infra stories skip `/plan-steps` and that `/infra-design` writes a Build Order into the Design instead, which makes its sessions longer. The pass goes through `.claude/skills/infra-design/SKILL.md` and the agents it calls, including the Build Order step, and cuts work that repeats itself or isn't needed.
- **Note Conventions loads on demand** (decision 2). It stops loading through `paths`: the `.claude/rules/note-conventions.md` symlink and its `paths` frontmatter go, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to it. Sarah decided 2026-10-06 to make it in this story.

It's a story rather than a `/tooling` change because it's too big for one session.

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

## Procedures Several Files Share
Each is kept in every file that uses it, and several copies have drifted. Under decision 1 and `rule-placement`, each becomes a shared-rule skill or joins an existing one, and the files that use it name it.
- **Checking a Leaning line:** the same paragraph is at `infra-design:51`, `investigate:39`, `assess:32` and `architect:43`. It says not to use `decision-researcher`, while `answer-confidence:16` says `decision-researcher` does the check. It goes into `answer-confidence`, which leaves who checks to each skill.
- **A gap answered on the spot, and the Decided/Rejected format:** `infra-design:57-60` and `architect:55-58` are near copies, and both send the agent to read all of `/decide` for the format at `decide:81-87`. It goes into `answer-confidence`'s Recording section.
- **Parking a decision for `/decide`** (an Open Decisions question, one `decision needed` entry, "Next: /decide"): `shape:147`, `investigate:84,98`, `decide:105`, `assess:49`, `architect:36`, `plan-steps:133`. It goes into `answer-confidence`.
- **"Her comments may already answer it":** `decide:28`, `investigate:27`. It goes into `answer-confidence`.
- **The wrong-type check:** `assess:27`, `investigate:32`, `architect:32` and `infra-design:31` restate AGENTS.md's "A note with the wrong type". Only "if the type fits, name the skill it needs and stop" is new, and it joins that rule.
- **Readiness checks shared by `/infra-design` and `/architect`:** `infra-design:31,37,38` match `architect:31,33,34`.
- **Splitting a story:** `assess:111-120` and `plan-steps:168-176`. Items 1–4 are word for word the same, and only the child's handoff and the stop command differ.
- **Writing acceptance checks** (the proves line, usable as written, one or two cases per rule, nothing already shown): `plan-steps:57,74,80-82`, `infra-design:96,100,101`, `plan-checker:26-28`. `plan-checker` and `split-checker` preload the shared skill.
- **Building a step:** `final-review:85,94,96-97` points into `implement/SKILL.md`'s "Settle the open choices", "Write the tests first", "Run the checks" and "Handle her feedback", and into `cleanup.md` and `bugs.md`, so a fix loads all of `/implement`. These become shared-rule skills (decision 8). `bugs.md:4` already says any skill can follow it.
- **Kicking off a collecting note for the building goal:** `kickoff:75-83`, with mode lines at `:17,24,52`, used by `roadmap:84` and `roadmap-placement:38-40`, each of which reads all of `/kickoff`. The two have diverged: `roadmap:84` has no "an open kicked-off copy already exists, move the item into it" case, so it could make a second dated copy. It becomes a shared-rule skill, and `/kickoff` keeps sweeps and roundups.
- **Deleting a note and its orphaned files** (`note-refs.sh`, `rm`, the Roadmap line, the links, the release check, `vault-orphans.sh`): `close:44,106,114`, `shape:104,108,129`, `tooling:84-87,93`. `tooling:86` sends the agent into `/close`'s file for one rule.
- **Fixing a CI failure:** `ci-failure` steps 4–5 (about 900 words) are followed by `dependency-updates:58-65,245,271-279`, each time with a list of differences, which loads all of `ci-failure`.
- **Session rules both routine skills restate:** the untrusted payload block (`dependency-updates:39` = `ci-failure:17`), stopping when a command fails (`:55`, `:32`), the pre-commit hooks and `--no-verify` (`:110`, `:63`), and the quoted heredoc and the pull request link (`:235,240`, `:75`). They move into `routine-sessions`.
- **`scope-router`'s "Where things go"** (`scope-router:14-41`, about 1,050 words) is used as a rulebook by AGENTS.md:108 and `shape:119,133,135`, which open the agent file. It becomes a shared-rule skill that `scope-router` preloads.
- **The Single Concern test as a procedure:** `target-designer:21-27` is a near copy of `assess:67-74` (Kind, a Job in one sentence without "and", server or client).
- **Creating an idea note:** `shape:97`, `decide:122`, `roadmap:67` and `tooling:41-44` restate defaults the Idea template already sets (`type` blank, "Next: /shape"). Cut each to "from `notes/templates/Idea.md`".

## Lines Repeated Across Files
These are plain repeats, which `rule-placement` says to remove without asking:
- **"Save its report to `.scratch/<note name> - …`"** in 10 skills (`/decide`, `/close`, `/plan-steps`, `/infra-design`, `/final-review`, `/investigate`, `/check-drift`, `/assess`, `/architect`, `/implement`), with the link-the-report lines at `decide:61,67,74` and `assess:64,88`. AGENTS.md's "Subagent reports and scratch files" already holds the rule. `/plan-steps` alone says "save to `.scratch`" three times, which is a likely reason agents treat `.scratch` as a place to save things, as Purpose describes. Only each file name is skill-specific. `implement:76` also writes open choices to `.scratch` with no reader and no reason.
- **The "Find a home for out-of-scope items" step** in 10 skills (`/architect`, `/assess`, `/check-drift`, `/close`, `/final-review`, `/implement`, `/infra-design`, `/investigate`, `/kickoff`, `/plan-steps`), each saying "if the list is empty, skip; otherwise route as AGENTS.md describes". It becomes one line in the last step.
- **"A hook blocks edits outside `notes/` and `.scratch/`"** in 11 skills. The hook's own message says this. "Don't change code" stays.
- **"One at a time" procedure lines,** which repeat AGENTS.md's question rule: `infra-design:73`, `tooling:45`, `roadmap:55,67,92,96,108`, `implement:117`, `shape:67,137`, `/decide`'s step 3 heading, and AGENTS.md:18,106,115 (the last two in bold, which is emphasis too).
- **Descriptions:** every command skill's description is imperative, where `instructions.md:23` asks for the third person. `answer-confidence` and `roadmap-placement` list the skills that use them in their descriptions, which load into every session and are already stale. Ten of the 11 agent descriptions end "Read-only.", which the tools list already shows, and four run 44–52 words (`leftovers-checker`, `split-checker`, `decision-researcher`, `scope-router`). Each becomes what and when, in about 25 words.
- **Agent openers** that say "you only suggest, don't change anything" in agents with only Read, Grep and Glob: `code-drift-checker:8`, `note-drift-checker:8`, `scope-router:9`, `split-checker:8`, `decision-researcher:10`, `plan-checker:8`, `rule-auditor:8`. Keep only what shapes the report, such as "don't pick a winner".
- **Pointers to sections of AGENTS.md** that load anyway and need no pointer at that point: `decision-researcher:30,31,51`, `target-designer:18-19`, `implement:43`, `investigate:74`, `architect:38`, `assess:75`, `tooling:31` ("or AGENTS.md").

## Inbox Item 1: Why the Implementation-Details Line Didn't Land
The Inbox item: AGENTS.md says implementation details are the agent's call, yet a session reminded Sarah three times that loading Note Conventions on demand reverses [[Notes Vault Repo]] decision 3, which is marked "Sarah's call". Found by reading AGENTS.md:15 and :21-31:
1. The exemption ("Implementation details that don't change what she sees are") is the third sentence of the "Her call, or what the app does: stop and ask her" bullet (:26), after the instruction. It reads as the counterpart of "even where she only approved it", so it covers only build choices she approved, never one marked as her call.
2. "Telling them apart" sorts choices by who made them, and "her own answer to a decision" makes any answer her call. Decision 3 changes that.
3. "Big" (:28) includes "reverses a **Decided** line" with no limit on what the line is about, so even an approved reversal forces a ⚠️ line.
4. The plumbing line (:15) is framed around routines and scripts, and "what she sees" is vague enough to cover how a file she reads loads.
5. No rule covers Sarah herself making a decision that changes an earlier one, so the agent raised it at every point it touched it.

The fix: the test of what a choice is about comes first. A choice about how something is built, such as a mechanism, where a file lives, how it loads, or which API or command flags a script uses, is the agent's call even when it's marked as Sarah's: make it and name it in the summary. "Big" covers only Decided lines about what the work does for her. When Sarah makes a new decision that changes an earlier one, the agent doesn't ask or warn, and names the affected note once in its summary. `answer-confidence:21` follows decision 3. Then the `dont-flag-reversed-build-decisions` memory is deleted, and `implement:165-166`, which restates the rule in other words, points to AGENTS.md.

A draft from the scan, for `/implement` to start from. It replaces AGENTS.md:15 and the cases at :25-29, leaves "Telling them apart" and the two reason bullets as they are apart from decision 3, and needs decision 17's "the user" wording:

> - **What to ask about.** Ask Sarah about what the app does or shows, and about what tooling, CI or a routine does for her. How something is built is your call when it changes neither, such as a mechanism, a file's location, how a file loads, or which API or command flags a script uses: make it, and name it in your summary. She cares what the work does for her, not how it's built, so this holds even where an earlier decision about it says "Sarah's call".
>
> - **Her decisions can change.** Her decisions, including one made earlier in the same session, the rules, designs and plans she approves, and her own lines in notes are her best call with what was known at the time. They stand until something gives a reason to change one, so don't reopen one without a reason. Two things are a reason: *(the two reason bullets, unchanged)*
>
>   What you do with a reason depends first on what the choice is about, then on whose it is:
>   - **If it's only about how something is built,** as "What to ask about" describes: change it as for an only-approved choice below, as a small change, even if it's marked "Sarah's call".
>   - **If it changes what the app does or shows, or it's her call:** stop and ask her. Show her the simple way or the new information on its merits, what it solves and what it costs, name the decision, rule or line it would change, and let her decide. What the app does or shows is never an agent's to change, even where she only approved it. *(the tool example, unchanged)*
>   - **If it's only approved:** make the change. *(Recording text unchanged.)* How you tell her depends on its size:
>     - **Big:** it changes what tooling, CI or a routine does for her, drops a piece from an approved Design, or reverses a **Decided** line about one of those. Open your summary with a bold ⚠️ line for it.
>     - **Small:** anything else, such as order, structure, wording or plumbing. Name it in your summary.
>
>   If Sarah makes a new decision herself that changes an earlier one, she has already decided, so don't ask about the earlier one or warn her about it. Handle the note that holds it as your skill or "A note that's wrong or out of date" describes, and name it once, in your summary.

## Inbox Item 3: Where a Pattern's Rules Land
`architect:51` ("usually a section of `docs/project_conventions.md`") stays in `/architect`. `rule-placement` would always answer "a doc in `docs/`" for a pattern, and the real choice, which doc and section, is one only `/architect` makes. Its "usually … `project_conventions.md`" anchors a choice that's wrong for some patterns, such as Unit Testing - New Centralized Mocks, whose Rules belong in `unit_tests.md`, so it becomes "the doc and section in `docs/` it lands in". Found by reading `architect:51,98` and `rule-placement`.

## Settled Without a Question
Plumbing, or what an approved rule already decides:
- `/close:82` and `/decide:139` inject the 969-word Next Step table on every run. `/close` reads it only in the idea-note case at `:78`, and `/decide` only at the steps that use it. Note Conventions' table loses its padding.
- `ci-failure:8,37` read all 3,399 words of `docs/ci.md` to find each failed job's script. It reads the failed job's last `run:` line in that commit's `.github/workflows/checks.yml` instead. `dependency-updates:261` names the four job-to-script pairs inline (`lint`→`lint:ci`, `type-check`→`check:types`, `unit-tests`→`test:coverage`, `build`→`build`), and its citation at `:44` goes.
- `/infra-design` checks a hedged answer to a Gap in the session (`:59`), as it already does a Leaning line, with no `decision-researcher` run.
- `/infra-design` makes a Piece whose exact form Sarah's answer already settled without asking for approval, as AGENTS.md's "Approval covers the edits" describes (`:63`).
- `/infra-design` stops saving the Build Order draft to `.scratch` (`:107`). It was copied from `/plan-steps`, where checkers read the file, and nothing reads it here.
- `/architect` stops sending `rule-auditor` the Enforcement (`architect:81`, `rule-auditor:12`). The auditor lists every place, including ones a later lint rule would catch, since the migration fixes them first.
- The rules for writing skills move into `writing-standard`'s `instructions.md`, under "Make Every Line Earn Its Place": a skill or agent, new or changed, justifies every doc it reads with a reason from its steps, and points to the section it needs or states the one fact, rather than loading a whole shared doc (from the `lean-skill-context` memory and `tooling:68`); fix an agent's judgment rather than adding approvals (from `fix-judgment-not-add-approvals`); and a note section the user edits by hand has no required format (from `free-form-sections-sarah-edits`). `tooling:68`'s middle sentence goes, and the three memories are deleted.
- AGENTS.md gets a rule for following links, next to the embed rule: a link to a heading or a block (`[[#^piece-7]]`, `[[Note#Section]]`) points to content the line depends on, so read the target when that line matters to the work. Both rules stay in AGENTS.md when "Editing notes" moves out (decision 5).
- The Roadmap's line 1 ("These should ALWAYS be planned and implemented individually …") is deleted, by Sarah's answer 2026-10-06, since sweeps, roundups and goal releases build items together. Line 3 ("DO NOT delete this file …") is reworded without capitals and with its reason.
- `/infra-design:3,17,81,101,117,125` name `/implement`, and change to `/infra-build` once it exists. Infra notes' `^status` lines change too.
- The Hub template's Coverage format (❓ for a gap) moves to `/decide`, which writes Coverage (`decide:102`). The Done When item format (`Goal.md:11`) moves to `/roadmap` step 2.

## AGENTS.md
Beyond decisions 3, 5 and 17 and the Inbox item above:
- **Inside "Editing notes", before it moves:** Where It Stands and the `^status` formats (:53-66, 436 words) are restated in five templates' comments, which decision 9 removes. :66 and :72 both say a finding for a later step goes at the top of that step's section. :47 puts the Check Drift prohibition between the bullet's opening and its cases; it becomes its own bullet. :85 ("A `ready` note goes back to `spec`") counts "Four changes don't count" and uses "a routed impact's acceptance check", which only `scope-router.md:20` explains; it becomes a condition with one example.
- **Roadmap rules that belong in `roadmap-placement`:** "A blocker outside the queue" (:77, no reason), "Starting on a story in the backlog" (:78-83, whose exception for `/implement` and `/tooling` comes after the instruction), and "A new item in a collecting note" (:84, whose only new content is that an item `/check-drift` moves back or `/kickoff` rolls over isn't new). :80's marker rule is also in the Roadmap's Markers, `tooling:49` and `kickoff:60`; the 📌 question gets one home in `roadmap-placement`.
- **Questions (:9-12):** :11's reason and :12's are the same fact ("she may see only the question"), so the bullets merge.
- **Doc gaps (:34-39):** three levels of nesting, with a step ("Drafting it") beside two cases; it becomes prose under "Anything else".
- **:14 and :19** say the same thing about open choices; :19 shortens to "ask about that choice alone".
- **Setup outside the repo (:13):** its second half restates the procedure for checks only Sarah can do; it becomes "walk the user through checks only they can do the same way".
- **:98, Immature stories:** an edge-case list of three kinds; it becomes the principle with one example.
- **:118, scratch files:** it says to link the report when showing findings, but not that the findings themselves go in chat; adding that makes the `scratch-files-not-for-sarah` memory redundant.
- **:145:** the break-it clause in the `pnpm test:agent` line repeats `implement/first-pass.md:28`; it goes.
- **:150, Git and files:** committing only this session's files leaves out the user's forgotten hand edits; the rule asks about each unexpected change, by file and content, and leaves a note another session is working on alone (from the `ask-about-unexpected-changes-when-committing` and `leave-other-sessions-notes-alone` memories).
- **:152-153:** the config and ignore-comment rules have no reason, and "explicitly" is emphasis.
- **Memory policy:** project rules live in checked-in files, memory holds only how to work with the user, and a memory is deleted once its rule is checked in (from `docs-updates-note-scope`, which holds it nowhere else). Any session can save a memory, so it goes in AGENTS.md.
- **Out-of-scope work:** another note's gaps against current conventions aren't an item, next to "Immature stories" (from `update-notes-when-touched`).
- **Routine sessions:** AGENTS.md loads into every routine session, and most of it is for interactive sessions; decision 5 removes the biggest part.

## Note Conventions and the Roadmap
- **Note Conventions:46-69:** the Next Step table's padding (about 1,300 tokens); rows 48, 49 and 64 describe how a skill works rather than what it produces, and become a short "produces X" (the `note-conventions-is-a-map` memory, which moves to `/tooling` step 3).
- **The collecting workflow note and the kicked-off copy** are described at Note Conventions:37 and :65, Roadmap:28, `tooling:11` and `roadmap:21`; the definition stays at :37, trimmed, and the mechanics stay with `/tooling` and `/roadmap`.
- **The standing goal** is defined at Note Conventions:41, Roadmap:10 and `Standing Goal.md:5`; Note Conventions keeps it.
- **Infra** is described at Note Conventions:22, :33 and row 58; :33 keeps it.
- **Note Conventions:39** ("It holds no priority; goals do") repeats Roadmap:22. **:22** puts "**not**" in bold.
- **Note Conventions:1-6:** the `paths` frontmatter goes (decision 2); the comment's last sentence, which says where the rules for editing notes live, stays as body text pointing to `editing-notes`.
- **Hubs** in Note Conventions follow decision 14.
- **Roadmap:24:** the status list leaves out `dropped` and repeats Note Conventions:8; it goes.
- **Roadmap:25** and AGENTS.md:61 both describe the status embed, worded differently ("except a goal's"); the Roadmap keeps it and AGENTS.md points there.
- **Roadmap:28** repeats :14 (the collecting note's line sits in Unaffiliated). **:27** points to AGENTS.md, which points to `roadmap-placement`; it points there directly. **:11** ("Keep this to 2-3 items") has no reason.

## Skills
**`/shape`:**
- Drafting a hub (:84-93) and splitting an idea (:95-100), about 420 words, move to supporting files.
- The Open Decisions drafting text is written twice (:88, :144), each with an example `answer-confidence` already has; once, pointing to `answer-confidence`.
- The confident, hedged and no-answer handling is written twice (:66-72, :137-140), partly restating `answer-confidence:9-11`.
- The Why section (:16-25, 310 words) repeats the steps; it keeps only the stop-at-direction reason, and :23 (pick the type by the shape of the fix) moves to step 4.
- "Don't answer the open decisions" three times (:19, :64, :122, the last in bold).
- The workflow cases (:35-39) restate Note Conventions:37 and put two exceptions before the rule they qualify.
- Plain repeats: :133 (a `ready` note goes back to `spec`), :119 (never create a sweep or roundup, from `scope-router`), :143, :147, :154 (plain filename, Note Conventions:74), :90 (bare headings).
- Repeats inside the skill: :93 and :158, :99 and :159, :108 and :129.
- :47 and :49 both limit reading external docs; :61 lists six example blocking decisions where two or three would do; :146's map of which step writes each section could shrink.
- Split check: no split. Its path is chosen after steps 1–2, which every path needs.

**`/investigate` and `/audit`** (decision 7):
- Leftovers from before the skill existed: :37 and :119 (an entry that waited on this skill being built), :107 (an older `# Fix Options` section; none exist), :120 (its Roadmap example), :39 and :117 ("or under Where It Stands in an older note").
- "Don't tell `bug-reproducer` the theory" three times (:21, :53, :69); keep the reason and one instruction.
- The re-investigation rule is split between :34 and :116.
- :101 restates AGENTS.md's "Approval covers the edits".

**`/decide`:**
- Check and Research (:58-66) spell out nearly the same message twice; one send, with what differs.
- Restatements of `answer-confidence`: :22, :54-56, :61, :86.
- :29 keeps "a list of effects on other notes", which is AGENTS.md's out-of-scope list under another name, and :129's "the running list" doesn't say which; it becomes the out-of-scope list, plus a list of new child stories for a hub.
- :34-36 is a one-item list followed by a sentence; it becomes prose.
- :102 restates and points to the `ready` → `spec` rule; :79 restates the approval rule.
- Split check: no split. Note type changes only small one-place branches.

**`/assess`:**
- :48-49 repeat AGENTS.md's Check Drift rules; :24 doesn't earn its place; :94 "explicit" is emphasis.
- Split check: no split.

**`/plan-steps`:**
- The test-only and E2E check sections (:84-100, about 350 words) move to a supporting file read when a step changes only test files; `plan-checker:24-25` points to them by name and changes too.
- :105 lists Coverage sources by type without cleanup's Current State, and calls Symptoms "a pattern's" though bugs have them too; :132 handles a new piece only for a feature. Name every type's source, or state it generally.
- :160 (update the status on the Roadmap line) is out of date, since lines embed `^status`; it goes.
- :131-133 restate AGENTS.md's "Open questions in notes are hers too"; only the `decision needed` entry, "Next: /decide" and the stop are the skill's.
- :151 puts its condition after the instruction; :93-95 are an edge-case list ("break behavior, not imports" plus two "counts" bullets); :23's hook sentence; :21 and :76 both ban "tests pass" as a check; :103 restates where a Boy Scout fix goes.
- The `trust-mantine-defaults` memory moves here, where checks are written: no check that only proves a Mantine default.
- Split check: no split. Type matters only in step 1 and in Coverage's source list.

**`/implement` and `/infra-build`** (decision 8):
- The infra path: `implement/SKILL.md:17-19,38-39,47,73,105,108,119-121,124-125,135-136,150,165-168` and `first-pass.md:10,15,35`.
- "List every choice with its source" is said four times (:26, :53, :64, :111); keep :53 and :111.
- :62 restates AGENTS.md's "What to ask about" (plumbing).
- :141-143: both bullets open with the same sentence and restate the approval rule.
- :97's hook sentence; :97-99 and `cleanup.md:7` run the checks twice, so cleanup runs first and the checks once; step 3 (:81-82) is two pointers and folds into step 4; :33-35 keeps only its images clause.
- `first-pass.md:18` repeats the sentence before it; `:28`'s command parenthetical repeats the step and AGENTS.md's Commands; `:20`'s open-choice rule is also at `SKILL.md:79,132` and `bugs.md:14`.
- `bugs.md:4` is a placement note, not an instruction.

**`/final-review`** (decision 4):
- :17-24 repeat `leftovers-checker:27-31`; it becomes one sentence: the user reviewed each step's diff, so this review looks across steps.
- :61 uses "fix here / route / skip" where AGENTS.md says "pull in / route / drop", and sits in step 3 while governing steps 4–5.
- :96-97 restate the approval rule; :71 puts its condition after; :89 has no reason (fixes are ordered by dependency); :87 repeats AGENTS.md's "Drop it".

**`/check-drift`:**
- The routing by type is written three times (:23, :113-126, :143); :23 also repeats :107.
- One rule (apply her changes; ask only where applying it is open) three times (:27-28, :51, :67); keep :51.
- The sweep branch (:69-75 and the sweep half of :87, about 280 words) moves to a supporting file.
- :128 says to mention status changes in the summary, but step 7's summary has no slot for it; :60 has no reason; :23 puts its exception after; :113 refers to "the findings' meanings in step 4" without naming them.
- Split check: no split.

**`/close`:**
- "A few rules" (:19-25) restates each step's reason; each reason moves into its step, once (about 250 words).
- :29-30 restate AGENTS.md's approval and open-choice rules; :44 and :114 describe what each script prints; "full step … not a summary" four times (:36, :39, :64, :103); :103 repeats AGENTS.md's route-or-drop line.
- :92 marks a child done or dropped in its hub's list, which decision 14 removes.
- The dropped-close branch (:84-86) could move to a supporting file; the saving is small.
- Split check: no split.

**`/architect`:**
- :18-19 are repeated at :49 and :84; :25-26 repeat :42; :86 restates AGENTS.md's "Work the story needs"; :124 trims to the next command.
- Split check: no split.

**`/infra-design`** (the pass, with decisions 10–12):
- The description (:3) is imperative and doesn't say when to use it.
- "Step" means both a section of the skill and a Build Order step (:36, :45, :81, :103); the skill's sections are referred to by name.
- :51 opens with Design-section questions before "The design has:", and misses the case of a question with neither a Decided nor a Leaning line (it's a Gap).
- :47, :63 and :68 restate the approval rule; they keep the unit of approval and point to AGENTS.md.
- :66 has no reason; :81's sentence on why they're called steps, :115 ("For an infra story …") and step 9 (folds into step 10) don't earn their place.
- :100 packs four rules into one bullet; it becomes sub-bullets, together with Agent Workflow Changes 2026-10-02's item "Build Order checks keep Sarah's part small", which changes the same rule.
- Two terms each: "Setup Outside the Repo" and "Setup", "Pieces" and "pieces", "the implementer" and "`/implement`".
- Split check: no split. Its only mode is new or revision.

**`/tooling`:**
- The spin-off branch (:39-50, about 415 words) moves to a supporting file; its restatements of `roadmap-placement` (:47) and the Roadmap's Ideas and Markers (:48, :49) become pointers.
- The Why section (:10-15, 232 words) re-describes workflow and collecting notes; it keeps only the reason a tooling change skips the lifecycle.
- :18 repeats the description and :35; :53-55 (step 2's opening) mostly repeats AGENTS.md; :60 repeats AGENTS.md's Docs line; :29 restates the building-goal check, which `implement:31` restates word for word; :93 describes the script's output.
- Split check: no split.

**`/roadmap`:**
- The Why section (:16-27, 297 words) is mostly plain repeats of "How this file works", which step 1 reads next; it keeps :23's rule on judging dependencies.
- :35 reads the Goal and Standing Goal templates on every run; each is read at the step that drafts from it.
- :64 points to "How this file works" for the one-goal rule, which lives in `roadmap-placement:12,24`.
- :79 says standing goals are never ranked, for the third time (:19, :103); :96 packs three rules into a paragraph and repeats the 🚨/📌 rule; :117 and :51 repeat AGENTS.md and the Roadmap; :38-39 and :99 repeat themselves.
- Shaping a standing goal (165 words) moves to a supporting file.
- Split check: no split. Its modes share step 3.

**`/kickoff`:**
- The building-goal mode leaves for a shared-rule skill (see Procedures Several Files Share); `/kickoff` keeps sweeps and roundups, and drops :17, :24, :52 and :75-83.
- "After this" (:21-24) restates Note Conventions' Next Step table, and the per-type next step is also at :50-52 and :73; it's kept once, in step 3.
- :57 and :62 restate the Roadmap's line format and 🎯 rules; :60's 📌 question moves to `roadmap-placement`.

**`dependency-updates`:**
- The failed-weekly-check mode (:30-37, :43-67, about 560 words) moves to a supporting file, or shrinks once the CI-fix procedure is shared.
- "Base" means the branch as the merge left it (:92) and also the pull request's base branch (:273); :92's term is renamed.
- Steps 4 and 6 (:181, :197) repeat step 8, and :184 repeats :10.
- :188-194, an edge-case list for parsing `repository`, becomes one sentence.
- The pull request body is described in two places (:209-219, :239-240); one section before the two pushes.
- :110 (commit message names the old and new versions) needs its reason: step 7 builds the body from the messages. :197 ("A reminder is never applied") has no reason; ask the user for it.
- :321-322 repeat :328; :237 and :133 put their condition after the command; :44 and :57 both list the job's commands; :113-117's glossary trims to `paths` and `patched_versions`.
- Split check: no command split, since the routine's prompt is fixed to `/dependency-updates`.

**`ci-failure`:**
- Step 4 (:44-63) is a git sequence out of order (the recipe checks out a branch before it's created); it becomes numbered steps: cut the branch, check the latest commit, diagnose and fix, commit, re-run.
- :30 and :132 both explain the merge GitHub tests; "in the cloud" and "here" both mean this session ("in this session" throughout); :117's "no note" is unclear; "PR" and "pull request" are mixed; the description is imperative.

**`routine-sessions`:**
- It serves two readers. The rules a running session needs (Branches, What the Session Can Use, the `gh api` rule, about 400 words) stay in SKILL.md, and the rules for writing a routine's skill (:7-12, :15-23) move to a supporting file read when writing or changing one.
- :41 and :12 repeat `docs/ci.md`; they point there. :28 and :37 name the skills that use other skills; :23 ("never assumes she has seen it") doesn't say what to do.
- The `routine.md` files are records that no session reads, so the docs part of the standard applies; small repeats only.

**Shared-rule skills:**
- `answer-confidence`: :13 has no reason and stands apart from the Hedged case; :10 says one thing twice.
- `running-the-app`: :13 gets its reason (the user starts their own server with `pnpm dev`), and the `stop-servers-you-start` memory goes; :13's last sentence goes; :9 and :18 both give the `seed/users.ts` path; :21 gets a reason for resetting to desktop.
- `retyping-a-note`: :8-10 open with background (about 90 words to cut); :24 restates "Drafts go in the chat"; :26 and AGENTS.md:75 both say to stop; :32 restates the Inbox rule and keeps only its timing.
- `roadmap-placement`: :14-16, two plausibility bullets, merge; the compelling-case rule (:18, :24) is stated twice, with a pointer to a section that doesn't hold it and no reason; :8 lists every goal-note section to read, and names `/tooling`; :20 packs four alternatives into one sentence with no reason; :21, :30 and :36 restate the Roadmap; :26 doesn't earn its place.
- `writing-standard` and `rule-placement` (checked, not reworked): `rule-placement:20` forbids naming users in a shared-rule skill while `instructions.md:23` asks a description to say when to use it, so one clause says a shared-rule skill's description names its trigger, not its users; `rule-placement`'s homes leave out Note Conventions, the templates and the Roadmap's "How this file works"; `instructions.md:23` doesn't say what "third person" means; `writing-standard/SKILL.md:36-41` puts "The Part for Your File" last, so line 8 names both parts and the closing section goes; :11 and :31 only point ahead.

## Agents
- **`scope-router`:** :27, :31 and :39 each say not to create a sweep or roundup, repeating the Roadmap; :24 and :32 repeat Note Conventions' template definitions; :41 (move the full text, never a summary) is also in the Hub template and the `preserve-design-refs-when-moving-work` memory; :12's grep mechanics; :15's kicked-off rule comes before the cases it governs; :24 and :30 repeat the case condition; the description doesn't say when.
- **`split-checker`:** :37 ("Hubs are never archived") contradicts `/close` and Note Conventions; :42 and :62 repeat the Hub template and the Roadmap; :34 repeats test 2; :43's Build Order goes and each child embeds the hub's Purpose (decision 14).
- **`plan-checker`:** :18 lists the approach for feature, pattern, sweep and roundup but not bug (Fix and Root Cause) or cleanup (Current State), which `plan-steps:28-34` has, so bug and cleanup plans get no checks; :21, :23-31, :35-36 and :39 restate `/plan-steps` (they go to the shared acceptance-checks skill or point to `/plan-steps`); :10-15 become one sentence; :38 puts its exception after; :27 is a 150-word bullet.
- **`decision-researcher`:** :23 restates "Her decisions can change"; :70-71 echo the caller's input back.
- **`code-drift-checker`:** :37-48 define the same Kind and Meaning sorting as `/check-drift` step 4 in other words; the skill sorts, so it leaves the agent, with the report fields at :57-58. :10's read-only Bash line matches `note-drift-checker:10` and differs from `leftovers-checker:24`; make them identical. :30 ("the docs in `docs/` lag far behind the code") may be stale; ask the user. :48's "Verification", `note-drift-checker`'s "Found by" and `/check-drift`'s "how it was found" are one thing.
- **`note-drift-checker`:** :36-45 hold the same sorting; `/assess:47-50` relies on its labels, so a short definition stays (or `/assess` sorts instead; ask the user). :56's "Found by" never varies; :15 names its caller; :22 is background; :24 puts its exception after.
- **`code-critic`:** :22-29 give three examples where two do.
- **`leftovers-checker`:** the description lists all five categories; trim to about 20 words.
- **`bug-reproducer`:** :20 repeats what its tools already enforce; :19 and :21 merge; :11's reason is restated at `investigate:21`, which keeps only "don't send it a theory"; :27 and :29 put conditions after. :25 and :27 are deliberate exceptions and stay.
- **`rule-auditor`:** :15 (you don't get the story's list) is also at `architect:84`; it leaves the agent. :8's "Be thorough." goes.
- **`target-designer`:** :18-19 point to sections of AGENTS.md that load anyway; "What not to read" stays.

## Templates
Decision 9 sets what the comments hold. Beyond the comments that decision removes:
- **Where It Stands** (Bug, Cleanup, Feature, Infra, Pattern :9, 151 words each) restates AGENTS.md, and its "or in the Inbox" contradicts AGENTS.md's Inbox rule. **Inbox** (8 templates, 75 words each) leaves out the rule for the user's own lines. **Open Decisions** (5 templates) defines the section more narrowly than `/shape:60-62`.
- **Lines that contradict the skill that writes the section:** `Bug.md:27` (create a Pattern note) against `investigate:71` (add it to the out-of-scope list); `Pattern.md:35` (Enforcement "Required.", and a list unlike `architect:66-73`'s, including "an agent instruction"); `Feature.md:39` (Suggested Approach's "reuse vs. build new" describes an older `/assess`); `Feature.md:42` and `Pattern.md:44` size steps as "small enough to review" where `/plan-steps` uses one idea per step.
- **Status-setting lines** (`Bug.md:36`, `Cleanup.md:34`, `Feature.md:42`, `Pattern.md:31,44`, `Infra.md:28`) and **"use another template" lines** (`Cleanup.md:18`, `Pattern.md:18`, `Infra.md:18`) repeat the skills and Note Conventions.
- **Sweep and Roundup** (`:21`, body text) copy the general sweep-or-roundup rule into every new note; each note keeps only its own topic rule. Their Items and issue format (`:26`) stays, since the template is its home, and its lifecycle sentences go; `scope-router:30` points to it instead of restating it.
- **Hub:** the Build Order section and the Status and Blocked by columns go (decision 14); `:7`, `:16`'s second half, `:22` and `:41` repeat `/decide`, `/close`, Note Conventions, `split-checker` and `scope-router`.
- **Feature:** Meta-Instructions moves under `# Design Handoff` (decision 16).
- **Idea.md:6** implies the user retypes the idea by hand; `/shape` does that. **Goal.md:5, Standing Goal.md:5 and Workflow.md:5** repeat Note Conventions and `/roadmap`; Workflow keeps only its sentence on a collecting workflow note's format.
- `assess:34,99`, `plan-steps:156` and `architect:63` say to replace a template comment, which AGENTS.md:88 already covers; 19 older notes still hold comments.

## Memory
All 77 memories were read in full on 2026-10-06, and checked-in files were grepped for each one's rule. Deleting a memory whose rule is checked in follows Sarah's policy in `docs-updates-note-scope`.
- **Delete, rule already checked in:** `agents-adapt-to-process`, `as-built-covers-review-gaps`, `batch-small-test-cleanups` (its leftover, "write a single obvious follow-on action into the item rather than calling it a decision", goes to `scope-router`'s Sweep case), `blocked-by-summary-not-per-decision`, `confirm-before-logging-process-feedback`, `convention-violations-are-tech-debt`, `delete-unreferenced-vault-files`, `designs-mostly-not-pixel-perfect`, `free-form-sections-sarah-edits`, `hubs-close-like-stories`, `leave-other-sessions-notes-alone`, `move-story-to-now-when-started`, `named-home-skips-scope-router`, `new-roadmap-lines-start-in-ideas`, `new-session-per-note`, `no-rules-for-hypothetical-cases`, `one-question-at-a-time`, `plan-outline-check-summary`, `preserve-design-refs-when-moving-work`, `prompt-doc-updates-immediately`, `recommend-on-best-practice-not-taste`, `records-belong-in-docs`, `reproduce-bugs-before-diagnosing`, `roadmap-spot-suggestions`, `roadmap-status-only`, `scratch-is-session-only`, `self-contained-questions`, `shape-reads-note-conventions`, `skill-invocation-confirms-relevance`, `skip-obvious-outline-confirmations`, `split-stories-design-in-hub`, `status-line-says-where-not-what`, `step-plan-standards`, `stop-servers-you-start`, `story-ready-definition`, `tooling-enforcement-is-docs`, `tooling-stays-general-on-roadmap`, `tooling-summary-table`, `work-the-kicked-off-copy`.
- **Delete, stale:** `migration-skills-skip-note-workflow` (names `/workflow` and `/review`), `moving-out-of-scope-work` (new lines go straight to the Roadmap; smells go to a `cleanup` note), `next-is-for-active-goals` (two goals share Next), and `docs-updates-note-scope` once its memory policy is in AGENTS.md.
- **Move, then delete:** `lean-skill-context`, `fix-judgment-not-add-approvals` (to `writing-standard`, above); `ask-about-unexpected-changes-when-committing`, `scratch-files-not-for-sarah`, `update-notes-when-touched`, `dont-flag-reversed-build-decisions` (to AGENTS.md, above); `block-on-unbuilt-skills` and `remove-without-tombstones` (to `editing-notes`); `general-mechanism-over-one-case` (to `scope-router`'s workflow-note case, saying it applies to workflow features, unlike pattern Rules); `note-conventions-is-a-map` (to `/tooling` step 3); `trust-mantine-defaults` (to `/plan-steps`); `repo-installs-its-tools` (to `docs/ci.md`, pulled in).
- **Keep:** `add-an-idea-means-a-note`, `apply-conventions-by-intent` (its example halves), `ask-approval-not-staging` and `sarah-reviews-in-ide` (merge into one, without the history line), `ask-sarah-facts-about-her-setup`, `check-docs-before-saying-undocumented`, `clear-choice-questions`, `convention-means-industry-standard`, `describe-what-is-not-what-isnt`, `dismissed-question-means-aside`, `dont-cite-no-verify`, `finish-cleanup-before-commit`, `mechanical-edits-skip-approval` (a stop-gap until its Agent Workflow Changes item lands; it says AGENTS.md forces approval of link rewording, though AGENTS.md:17 already lets a link swap through, so only `shape:107` forces it), `no-agile-vocabulary`, `no-feelings-management` (without its history line), `no-reason-to-pull-work-from-goal` (Sarah decided 2026-10-06 it stays as a memory and isn't written into the goal note), `point-out-wrong-premises`, `priority-questions-mean-rethink`, `recheck-means-real-issues-only`, `roadmap-is-the-view`, `sarah-names-are-placeholders`, `tech-debt-means-app-health`.

Where each memory to delete already has its rule, as of 2026-10-06. Some of these lines move or go in this story, so check that the rule still lives somewhere before deleting the memory:

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
| `new-roadmap-lines-start-in-ideas` | `scope-router:35`, Roadmap:15, `tooling:46-48`, `roadmap-placement:30` |
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
| `tooling-stays-general-on-roadmap` | Roadmap:14, `roadmap-placement:21`, `roadmap:49,73-76` |
| `tooling-summary-table` | `tooling:74,96` |
| `work-the-kicked-off-copy` | `tooling:21` |
| `migration-skills-skip-note-workflow` (stale) | `tooling:3,10-13`, Note Conventions:37 |
| `moving-out-of-scope-work` (stale) | `scope-router:21-23,27,35-37`, AGENTS.md:85 |
| `next-is-for-active-goals` (stale) | Roadmap:6-21 |

## Pulled In During Triage
Sarah pulled these in on 2026-10-06, during this run's out-of-scope triage:
- **`/final-review`'s checks:** answered by decision 4. Today nothing in `/final-review` or its three agents checks the Purpose or names best practice (grep for "Purpose" and "best practice"); `:57` and `:59` check against the written plan; nothing reads the "Sarah's call" marks, and `target-designer:15` can't see them.
- **"After a retype" in `/decide` and `/plan-steps`:** a retype can leave a note at "Next: /decide" or send it to `/plan-steps`, but neither skill follows the `retyping-a-note` skill's "After a retype" (`infra-design:28`, `investigate:30`, `assess:24` and `architect:29` do), so the retype line can sit in the Inbox past the next skill and approved content can be redrafted. Both follow it.
- **Copied status in notes:** moved from Agent Workflow Changes 2026-10-02, where it read: "**Notes copy a story's status instead of embedding it** - the Hub template's Child Stories table (`notes/templates/Hub.md:24`) has a Status column that each hub fills in by hand, so it goes stale as soon as a child moves on: CI Checks still listed CI Failure Sessions as `spec` after it had gone to `ready`. Where a note needs a child's status, it should embed the child's `^status` line (`![[<child>#^status]]`) instead of restating it, and a note shouldn't show a status at all where it doesn't add value. Check the templates, and the skills and agents that fill them in (such as `split-checker`, `/decide`, `/shape` and `/close`), for copied status, and settle with Sarah which places need one. Other hand-kept copies of a child's state, such as the hub's Blocked by column and the "(done)" markers in Build Order, may be the same problem. Sarah: 'If a hub or a stub needs to have a child's status it should be a link to the status rather than recreating it. And we shouldn't be linking status anywhere it doesn't add value.' Found 2026-09-30 during `/implement` on CI Failure Sessions Step 1." Decision 14 answers it for hubs; the other templates and skills still get the check it asks for.
- **`dependency-updates`' path for a check that fails only on GitHub** (`:270-308`): answered by decision 15.
- **The `repo-installs-its-tools` rule:** `docs/ci.md:13-20` covers CI and cloud tools installed from `mise.toml`, but not tools the hooks and scripts need on the user's machine. The rule goes into `docs/ci.md`, the one exception to leaving `docs/` to Docs Audit, and the memory is deleted.
- **The general rule copied into collecting notes:** Style Fixes, Style Decisions, Code Tidy-Ups and Unit Test Tidy-Ups each carry the general sweep-or-roundup rule in What Belongs Here, and Style Fixes and Code Tidy-Ups have drifted from the template ("Give it its own Roadmap line until it's decided", with no roundup). Each keeps only its own topic rule.
- **The hooks' header comments:** `notes-only-edits.sh:2` lists the skills that register it, and the list is stale (`/shape`, `/investigate`, `/decide`, `/architect` and `/infra-design` register it too); `protect-config.sh`'s header names `/implement`. Both drop the list and say what the hook does.
- **`code-critic`'s callers:** it's written for `/assess` reviewing code before it's built (`code-critic.md:11,17`). `/final-review` calls it on built code and `/investigate` with a fix's job; it says how its checks change for each.
- **`rule-auditor`'s Enforcement input:** settled above, under Settled Without a Question.
- **`/investigate` has the user approve all of Current State before it's written** (step 4, "Draft the changes and show them to Sarah before writing"): for this story that was a 7,000-word draft, which Sarah said was too much to review, so the findings went in unreviewed. `/audit` (decision 7) writes the scan's findings without approval, and keeps approval for decisions and for sections that change the plan. Pulled in after triage, 2026-10-06.

## Wording Differences to Settle in /implement
Under decision 6, each of these is asked at the step that edits the file: is the difference a deliberate exception, which stays, or drift, which goes? Each was found by reading both places.

| Where | It says | The rule kept elsewhere says |
|---|---|---|
| `answer-confidence:25`; `decide:87`, `architect:58` | Rejected lines only for options she named and turned down | one Rejected line per option she considered, or turned down |
| `bug-reproducer:29` | set the screen size "with `resize_window`" | `running-the-app:21`: use the `mobile` preset, then set it back to `desktop` |
| `retyping-a-note:31` | raise a carried piece that new information makes look wrong, and let her decide | AGENTS.md "Her decisions can change": a choice only approved is changed and reported |
| `roadmap:56-61` | "In" outcomes include a line in Planning | `roadmap-placement:31`: "Under a goal's heading, or in Now or Next" |
| `roadmap:84` | kick off every collecting note with an unblocked item for the building goal | `roadmap-placement:38-40`: if a kicked-off copy is open, move the item into it |
| `infra-design:107,110` | approve the Build Order from an outline plus a link to the draft | AGENTS.md "Drafts go in the chat" |
| `infra-design:60`, `decide:78` | print the Decided line in chat and go on | AGENTS.md "Approval covers the edits": list it in the summary |
| `infra-design:78` | always show the change and wait for approval | AGENTS.md "Approval covers the edits": a change whose form is settled is made and listed |
| `implement:165-166` | change "choices Sarah merely signed off on, not ones she made herself or cares about", and only for infra | AGENTS.md "Her decisions can change", for every type, with "only approved" and "her call" |
| `implement:67` | ask about one choice at a time, "even when several belong to the same function or component" | AGENTS.md: one question at a time |
| `implement/bugs.md:7` | a pure logic bug can be diagnosed from the code | `/investigate`'s rule, and the `reproduce-bugs-before-diagnosing` memory: diagnosing from code needs the user's sign-off |
| `implement/cleanup.md:5` | count only factory bodies that are "word-for-word the same" (a codebase rule in an agent file) | `docs/unit_tests.md` "Creating Centralized Mocks": "the same factory body" |
| `tooling:62-64` | small, clear edits are written without showing them first | AGENTS.md "Approval covers the edits": new wording is shown first |
| `tooling:15` | another approach is suggested "once", with its reason | AGENTS.md "Open choices are hers" and "Recommendations" |
| AGENTS.md:150 | "Don't commit unless Sarah asks" | `dependency-updates` and `ci-failure` commit and push unasked |
| `shape:99,159` | ask which Roadmap section a line goes in | AGENTS.md "Roadmap order": suggest a spot when the notes make it clear |
| `shape:43`, `investigate:41` | running the skill means she believes the story is still relevant | AGENTS.md "Starting on a story in the backlog", which could say it once for every skill |
| `investigate:82,96`, `check-drift:102` | recommend one option | AGENTS.md "Recommendations": say so when it comes down to her preference |
| `decision-researcher:35`, `decide:72` | "stronger than AGENTS.md 'Recommendations'", always recommend unless it's preference; or it "can't be decided yet" | AGENTS.md "Recommendations" |
| `final-review:108` | "Write nothing else to the note" | AGENTS.md "Where It Stands": whoever moves a story forward updates the status line and the summary |
| `scope-router:21` | update the story's Roadmap line to say what needs re-review, and add an unnamed `blocked-by` entry | AGENTS.md: a Roadmap line only embeds `^status` |
| `scope-router:35` | a new Roadmap line goes in Ideas | AGENTS.md "Roadmap order": ask where a new line goes |
| `split-checker:51-52` | a child's Where It Stands holds just its next step, and Purpose says it was split from the hub | AGENTS.md: the status line plus a summary, and the split-from line goes in the summary |
| `code-critic:16` | list every job; more than one is a finding | `project_conventions.md` Single Concern: two jobs are separate if each can be described without the other; `assess` and `target-designer`: one sentence without "and" |
| `Hub.md:38` | Open Decisions notes "any constraints existing stories already impose" | the story templates' Open Decisions comment |
| `Idea.md:10`, `Workflow.md:9` | no Inbox and no summary under the status line | AGENTS.md: every story and hub has both |
| Out of Scope comments: `Feature.md:27`, `Infra.md:37`, `Cleanup.md:27`, `Pattern.md:41`; `Roundup.md:30`, `Sweep.md:30` | "each item should also be on the Roadmap", or "related problems found along the way"; or "work that belongs to another story, sweep or roundup, with a link" | AGENTS.md "Out-of-scope work": items are routed to a note, a sweep, a roundup or a Roadmap line, or dropped |

# Open Decisions
1. When should a skill be split into separate skills that share rules?
   - **Decided 2026-10-06:** A skill is split by mode when a run takes one of several paths chosen at its start, such as by the note's type, and the modes truly share little. Each mode becomes its own command, and steps both modes truly need are written into each. How much they truly share is judged skill by skill: for each step that looks shared, the scan asks whether every mode needs it as written, or whether one mode was fitted into steps written for another. A procedure more than one skill follows becomes a shared-rule skill, as `rule-placement` describes, and a branch that sits in one place in a run goes to a supporting file. A SKILL.md over about 5,000 tokens, or a variant woven through many of a skill's steps, is a smell: it gets a closer look, not a split on its own. Sarah's call: new commands cost her little, since the Roadmap says what to run on each story. Checked against the code and notes.
     - Rejected: never split, only move branches into supporting files - it leaves skills full of mode branches.
     - Rejected: split by length - a short skill doing several jobs would pass, so length is only a smell.
     - Rejected: keep one command per lifecycle step, with `/implement` handing an infra note to a variant skill - the variant could run without `/implement`'s checks and config hook, and Sarah doesn't need few commands.
2. Should Note Conventions stop loading whenever a session reads a file in `.claude/skills/` or `.claude/agents/`?
   - **Decided 2026-10-06:** Yes. Note Conventions moves out of `.claude/rules/` and loads on demand: a session that needs the map reads it, as `/tooling` and `/shape` already do, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to it. Reading a skill or agent file doesn't mean a session needs the map, so a read trigger loads it mostly where it isn't used, such as every `/implement` run.
     - Rejected: keep the `paths` trigger on `.claude/skills/**` and `.claude/agents/**` - it loads about 1,900 words into every `/implement` run, and makes decision 1's supporting files cost more context than they save.
     - Rejected: narrow `paths` to `.claude/skills/*/SKILL.md` and `.claude/agents/*.md` - reading another skill's SKILL.md still loads it into sessions that don't need it.

3. When does a **Decided** answer count as Sarah's call?
   - **Decided 2026-10-06:** Only when Sarah gives a reason of her own or says the choice matters to her. Picking from the options she was shown, such as to let a blocked story move, makes the choice only approved. Why: a past session recorded an answer this way when Sarah had only picked the option that looked best so a blocked story could move, and later agents then treated that choice as one she cared about. Sarah's call.
     - Rejected: ask each time whether it's her call - accurate, but adds a question to every decision.
4. What does `/final-review` check?
   - **Decided 2026-10-06:** In this order: (1) whether the built story does what its Purpose, and its Goals or Requirements, set out to do; (2) the code against best practice and the project's conventions, for every note type; (3) the code against the plan, where what Sarah said she wants specifically has to match, and what she only approved can be built differently, a difference being a finding only if (2) would flag it. For (2) and (3), an As built note that explains why the build goes against best practice, a convention or something she asked for is weighed: if the reason holds up it isn't a finding, and if the agent got it wrong it is. Sarah's call, from her line about `/final-review` and her changes to the draft. This replaces `final-review/SKILL.md:57`, which makes every difference from the approved Suggested Approach a finding, and `:59`, which checks other types only against their own Design, Conventions or Decided lines.
5. Where does AGENTS.md's "Editing notes" live?
   - **Decided 2026-10-06:** In an `editing-notes` shared-rule skill that loads before a note in `notes/` is changed, like `writing-standard`. Skills that write notes name it at the step where they write. AGENTS.md keeps a pointer and the three rules any session could break: never edit or write in Sarah's lines, never reorder the Roadmap, and only `/check-drift` writes Check Drift callouts. The rules for reading embeds and links stay in AGENTS.md, since sessions that only read notes need them. The out-of-scope triage procedure moves to a shared-rule skill the same way, as `rule-placement` describes.
     - Rejected: keep it in AGENTS.md - about 1,400 words in every session and subagent, most of which never edit a note.
6. When are the places where a skill words a rule differently from where it's kept (exception or drift, as `rule-placement` describes) settled?
   - **Decided 2026-10-06:** During `/implement`, at the step that edits that file. Current State lists each with both wordings, and `/plan-steps` puts each in the step that edits its file. Sarah's call: the story will likely split into many smaller stories, and she can answer better with the file fresh.
     - Rejected: settle all of them in `/investigate` - about 30 questions, asked away from the files.
7. How does `/investigate` split?
   - **Decided 2026-10-06:** `/investigate` keeps bug notes. A new `/audit` command takes a cleanup note to `spec`: it scans the code in the note's scope, settles with Sarah how to tidy it, and writes Current State and Open Decisions. The two modes share little: every reason in `/investigate`'s "why" section is about bugs, and its cleanup step borrows from the bug step.
8. How does `/implement` split?
   - **Decided 2026-10-06:** Infra moves out: a new `/infra-build` command builds an infra story's Build Order, with its own `protect-config.sh` hook. Infra is woven through nearly every step of `/implement` and follows a Build Order rather than `/plan-steps`' steps. The procedures both commands share (settling open choices, writing tests first, running the checks, cleanup, fixing a bug) move into shared-rule skills that `/final-review` also uses, instead of pointing into `/implement`'s SKILL.md.
   - **Still open:** whether feature, pattern, sweep, roundup, bug and cleanup all stay in `/implement`. Sarah can't judge it until the skills before `/implement` are reworked, since what they hand `/implement` decides whether one command fits. It's answered in the story that reworks `/implement`, after that work.
9. What does a template comment hold?
   - **Decided 2026-10-06:** Only what a person needs to fill in the section by hand. A section the user fills in gets one line on what it's for, plus its format where it has one, and the template is the one home for that format. A section a skill writes gets at most "Written by `/<skill>`." A rule an agent follows lives in its skill, agent or AGENTS.md, so the Done When item format moves to `/roadmap` and the hub's Coverage format moves to the skill that writes it. Body text that becomes part of the note, such as the Meta-Instructions blocks, isn't a comment and isn't covered by this.
10. What does a revision with `/infra-design` or `/architect` rework?
    - **Decided 2026-10-06:** Only what its trigger names, such as the Inbox item, the `^status` line or Sarah's answer. `/infra-design` still runs the Goals check, and every other section keeps its approval unless the rework changes it. Today a revision re-approves every section; Branching and Releases' revision would take about 55 approvals.
11. What does a Build Order's Implementer check say?
    - **Decided 2026-10-06:** Only what the Design doesn't: how a requirement or failure path gets checked, and what to do if it fails. `/infra-design` gives each Piece a block ID (` ^piece-N`), a step's **Builds:** line links its Pieces (`[[#^piece-7|Piece 7]]`), and a check about one Piece links it instead of restating it. The links are Sarah's call.
12. What does a Design's Flow cover?
    - **Decided 2026-10-06:** Only what no single Piece holds: what starts a run, the hand-offs between Pieces and failures that cross Pieces. It links each Piece it mentions.
13. What does `/tooling` do with a blank-type note in `notes/features/tooling/`?
    - **Decided 2026-10-06:** Treat it as story work and send it to `/shape`. The case that called it a pre-workflow note and asked whether it's a workflow note goes, since `/tooling`'s own spin-off now creates blank-type idea notes.
14. What is a hub for, and what does it show about its children?
    - **Decided 2026-10-06:** A hub holds shared design. It has no Build Order: a child that waits on another story says so in its own `blocked-by`, and the Roadmap decides order. Sarah's call: she reads the Roadmap for order and status, and hubs obscured it. The Child Stories table keeps Story and Scope, which `/close` and `/decide` use, and drops Status and Blocked by, which nothing reads. `/close` stops marking a child done or dropped in the hub's list. When `split-checker` or `/decide` creates a child, it embeds `![[<hub>#Purpose]]` in the child's Purpose, so the hub's Meta-Instructions reach whoever works on the child (Sarah's call). The Hub template keeps its Meta-Instructions. The four existing hubs stay as they are (Sarah's call: notes join this story only when one can't move through its workflow, and `/close` still works on them).
15. What does `dependency-updates` do when a check fails only on GitHub?
    - **Decided 2026-10-06:** What it does today, moved to a supporting file the skill reads only when a check passes locally but fails on GitHub. `rule-placement` gets the case behind it: a rule only one branch of a skill's run needs goes in a supporting file the skill reads where that branch starts. Sarah's call: edge-case workflows are kept but loaded only when needed.
      - Rejected: re-run once, then report and leave the pull request for Sarah - the pull request would stay red until she looks.
16. Where do the Feature template's Meta-Instructions live?
    - **Decided 2026-10-06:** They stay in the template, word for word, moved from under `# Out of Scope` to under `# Design Handoff`. Sarah's call: they're clearer than any skill's line, and they reach every skill and agent that reads a handoff.
      - Rejected: move them into the skills - seven skills and four agents read handoffs, and the skills' lines say less.
17. What do instructions call the person they work with?
    - **Decided 2026-10-06:** "The user", wherever an instruction means whoever is running the session. What agents write into notes keeps Sarah's name where it records that she made a call, such as "Sarah decided …", "Sarah's call" and her `[Sarah]` tags. Sarah's call: she doesn't want a hypothetical user called by her name.

# Out of Scope
- The docs in `docs/` and `README.md`: [[Docs Audit]], apart from the rule from the `repo-installs-its-tools` memory, which goes into `docs/ci.md`.
- Story notes in `notes/`, apart from updating their references to a skill this story splits or renames, and the four collecting notes' What Belongs Here. The four existing hubs stay as they are (decision 14).
- No skill writes a pattern note's Root Cause: an item in [[Agent Workflow Changes]].

# Acceptance Criteria
- [ ] Each procedure under "Procedures Several Files Share" lives in one place, a shared-rule skill or a supporting file, and the lines under "Lines Repeated Across Files" are gone.
- [ ] AGENTS.md no longer holds "Editing notes". A headless session that edits a note loads `editing-notes`, and one that only reads notes doesn't.
- [ ] `/audit` and `/infra-build` exist, and `/investigate` and `/implement` no longer carry the cleanup and infra paths.
- [ ] `/final-review` checks the Purpose, best practice and conventions, and the plan, as decision 4 describes.
- [ ] Each memory under Delete or Move is gone from the memory folder and `MEMORY.md`, and its rule is where Current State says.
- [ ] Template comments hold only what decision 9 allows, and instructions say "the user" where they mean whoever runs the session.
- [ ] Each wording difference has the user's answer, and its line is kept or removed to match.
- [ ] Unchanged: each skill still takes a note through the same lifecycle step, from `/shape` through `/close`, checked by running each on a story; the two routines still run.

# Implementation
Sarah, 2026-10-06: links, to a heading or a block ID, may turn out to be how many of these files handle drift and repetition, rather than copies. She expects the story to split into many smaller stories, and decision 8's open question travels with the `/implement` work.
