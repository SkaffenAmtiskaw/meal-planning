---
type: infra
status: in-review
confirmed: 2026-10-06
---
# Where It Stands
All steps implemented. Next: /final-review ^status

Shaped 2026-10-06 as infra: a standard for good docs and agent instructions, drawn from research, that an agent loads only while it edits those files. Its decisions and design were settled the same day: a `writing-standard` shared-rule skill holding a shared core with a part for docs and a part for agent instructions, a `rule-placement` shared-rule skill for where a rule lives, and pointers from AGENTS.md, `/tooling` and `/infra-design`. All three steps are built: the `writing-standard` skill, with its docs and agent-instructions parts, the `rule-placement` skill, the pointers to them from AGENTS.md, `/tooling` and `/infra-design`, and the deletion of the five memories they replace. Headless runs showed sessions loading the standard before drafting and not loading it when only reading, and Sarah confirmed the drafts follow it. What remains is the review of the whole story. Spun off from [[Agent Workflow Changes 2026-10-02]] during `/tooling` on 2026-10-06.

# Inbox

# Purpose
Define what good docs and good agent instructions look like in this repo, which might not be the same, and make sure every agent that edits them can read that while it's editing them, and only then. Docs are the files in `docs/` and `README.md`. Agent instructions are AGENTS.md, skills and agents. Sarah, 2026-10-06, during `/tooling` on [[Agent Workflow Changes 2026-10-02]]: "I'd like it to not just make sure agents read them as a whole, I want them to actually make them good. Sometimes agents read it as a whole but still propose a jumbled mess of bullet points. This means we need to define what 'good' looks like." And: "I don't want a massive dump into context of what good doc looks like for every agent. I want to make sure it only reads what good doc looks like when it is actually editing docs."

The standard applies to edits from the time it exists. The slimming pass in [[Agent Workflow Changes 2026-10-02]] waits on this story, and [[Docs Audit]] then checks the existing docs against the standard it sets.

# Goals
- [x] An agent that drafts or changes a doc or an agent instruction reads the standard before it drafts, whether it's running a skill or working without one.
- [x] A draft of a doc or an agent instruction follows the whole standard: the shared core and the part for its kind of file.
- [x] A session that reads docs or agent instructions without changing them doesn't load the standard.

# Open Decisions
1. Do project docs and agent instructions share one standard, or does each get its own?
   - **Decided 2026-10-06:** a shared core plus a part for each. The core holds the writing and editing qualities both share (reading as one piece, conditions before instructions, plain and consistent wording, explaining why, key points first, lists only for truly separate items, title-cased headers), and an agent reads the core plus the part for the kind of file it's editing; where the two differ, the core states the principle and each part says how it applies, so nothing overrides the core. Google's style guide and Anthropic's guidance on instructions agree on how text is worded and organized and differ on audience, voice and form, and keeping each shared quality in one place stops copies drifting.
     - Rejected: two fully separate standards - about half the content would exist twice and drift apart.
     - Rejected: sharing only the editing process - the shared writing qualities would still be written twice, and reading as a whole alone doesn't make a doc good.
2. What form does the standard take, so that an agent loads it only when it's editing docs or agent instructions?
   - **Decided 2026-10-06:** a shared-rule skill (`user-invocable: false`) whose SKILL.md holds the core and says which part to read, with the docs part and the agent-instructions part as supporting files that load only when read. `/tooling` points to it by name at the step where it drafts, a line in AGENTS.md's "Docs" list points every other session to it, and a reviewing agent preloads it with `skills:`. Revised 2026-10-06 during `/infra-design`: `/implement`, `/final-review`, `/check-drift` and `/close` already reach doc edits through AGENTS.md's "Docs" list or "Doc gaps", so that one line covers them.
     - Rejected: a pointer in each skill that edits docs or agent instructions - each would be a second copy of the AGENTS.md line. It's the only form that reaches an agent before it drafts and never loads on reads, it follows Anthropic's guidance to put style guides in a skill and split domains into files read only when relevant, and it's this repo's pattern for a shared rule only some sessions need.
     - Rejected: path-scoped rule files in `.claude/rules/` - they load whenever a matching file is read, which is most sessions, and miss AGENTS.md, which loads at launch.
     - Rejected: an edit-gate hook - it fires at the edit, after the draft is written and approved, and needs a settings file routines may not read.
     - Rejected: a reviewer subagent on its own - the writer would still draft without the standard; it could be added later on top of the skill.
3. Is the standard built on a published framework, such as Diátaxis or Google's developer documentation style guide, or is it our own list drawn from research?
   - **Decided 2026-10-06:** our own list drawn from research. Sarah's call.
4. Does the standard get any automated checking from an existing tool, and if so, which one? Candidates:
   - Vale
   - markdownlint (markdownlint-cli2)
   - textlint
   - no tool
   - **Decided 2026-10-06:** no tool for now; the skill carries the standard and review catches the rest. Almost all of the standard is judgment (reading as one piece, explaining why, key points first, lists only for separate items, how prescriptive a doc is, assumed knowledge) that no candidate can check, and the one strong mechanical match, title-cased headings, is a preference Sarah would never reject work over. If [[Docs Audit]] or the slimming pass turns up a recurring mechanical problem such as terms drifting, Vale is the tool to revisit; a reviewer agent on top of the skill is the fit for the judgment-heavy qualities.
     - Rejected: Vale with our own rules - it checks only title case and a word list, adds a Go binary that routine cloud sessions can't install, and would flag most existing skill headings.
     - Rejected: markdownlint-cli2 - it checks Markdown formatting, not anything in the standard, and its defaults clash with how the repo's docs and skills are written.
     - Rejected: textlint - its English rules date from 2020-21 and it checks less than Vale for more assembly work.

# Design
## Pieces
**Piece 1: The core** - `.claude/skills/writing-standard/SKILL.md`, with `user-invocable: false`. Holds the writing and editing qualities docs and agent instructions share, and says which part to read next.
- Its description says when to use it: before drafting or changing a file in `docs/`, `README.md`, AGENTS.md, `.claude/skills/` or `.claude/agents/`. It's written in the third person, and it's what lets a session with no skill pick the standard up.
- It holds the qualities Decision 1 names: reading as one piece (an addition means rereading the section it lands in and restructuring it, not wedging text in), conditions before instructions, plain, complete and consistent wording with no shorthand, explaining why, key points first, lists only for truly separate items, and title-cased headers as a slight preference that's never a reason to reject work.
- It takes in `/tooling`'s "Writing instructions" and "Readable as a whole" bullets and the `restructure-for-readability` and `condition-before-instruction` memories, worded so they hold for both kinds of file.
- It's drawn from Google's developer documentation style guide, Google's Technical Writing One, Anthropic's prompting best practices, its skill authoring best practices, "Effective context engineering for AI agents" and Claude Code's memory docs.
- Where the two kinds of file differ, the core states the principle and each part says how it applies. Nothing in a part overrides the core.
- Each quality gives its reason in a sentence or so.
- It's short, since it loads in every session that edits these files, and it meets its own standard.
- It holds only the standard, never which skills use it.
- It ends by naming the part to read: `docs.md` for `docs/` and `README.md`, `instructions.md` for AGENTS.md, skills and agents. A change that touches both kinds of file reads both.

**Piece 2: The docs part** - `.claude/skills/writing-standard/docs.md`. Says how the standard applies to docs (`docs/` and `README.md`), read only when one is being drafted or changed. It holds:
- Docs describe the codebase in a guide's voice, not as instructions to an agent, and are less prescriptive than they are today: a reviewer would call out messy mocks in a PR, where a doc today sets a rule like the 3-test-file threshold.
- A doc that grows from a pattern's Rules is a guide: what to do, where things go and why. Enforcement gets at most a closing paragraph, naming only enforcement whose location isn't obvious (from `docs-are-guides-not-rule-lists`).
- It's readable by a person with no assumed knowledge: it says who it's for and what the reader needs to know first.
- Each doc is one kind of document: a how-to, a reference or an explanation, drawing on Diátaxis for this point only.

Its sources are Piece 1's plus Diátaxis.

**Piece 3: The agent-instructions part** - `.claude/skills/writing-standard/instructions.md`. Says how the standard applies to AGENTS.md, skills and agents, read only when one is being drafted or changed. It holds:
- Write for a smart reader and add only what it doesn't already know, the opposite of the docs part's "assume no shared knowledge"; both apply the core's principle of writing for the reader.
- Length costs adherence, so every line earns its place.
- How much freedom an instruction gives depends on how fragile the task is: exact steps for a fragile task, the goal and its reason for one that takes judgment.
- A few good examples rather than a list of edge cases.
- No emphasis words like "CRITICAL" or "You MUST".
- Procedure form: numbered steps for a sequence, cases as sub-bullets under their rule with each condition first, and a skill's description in the third person saying what it does and when to use it. This is how the core's "lists only for truly separate items" applies to instructions, where headers and bullets help an agent more than they help a person reading a guide.
- An instruction that has an agent write a doc points to the standard, rather than carrying its own rules about how a doc is written.

Its sources are Anthropic's prompting best practices, its skill authoring best practices, "Effective context engineering for AI agents" and Claude Code's memory docs.

**Piece 4: `/tooling`** - `.claude/skills/tooling/SKILL.md`, steps 2 and 3. Sends `/tooling`'s drafting and placement decisions to the two shared-rule skills:
- Step 2: the paragraph on where a rule goes, under "where the change belongs", is replaced by a pointer to decide it as the `rule-placement` skill describes.
- Step 3: the "Writing instructions" and "Readable as a whole" bullets come out, since their content moves into Piece 1, and a pointer goes in where step 3 drafts: before drafting a change to a doc or an agent instruction, read the `writing-standard` skill.
- Step 3: the "AGENTS.md, the docs and shared-rule skills" bullet comes out, since its content moves into Piece 7.

The "New skills and agents" bullet stays, and the Convention on reviewing agents lands there.

**Piece 5: AGENTS.md** - Points every other session to the standard:
- A line in the "Docs" list: "the `writing-standard` skill: before drafting or changing a file in `docs/`, `README.md`, AGENTS.md, a skill or an agent".
- "Doc gaps" → "Drafting it" drops "match the doc's existing style" and becomes "show her the draft and write it once she approves", since the "Docs" line now says how a doc is written.

`/implement` reaches the standard through this line, since it reads what the "Docs" list names when the work needs it. `/final-review` makes its fixes by following `/implement`, and `/check-drift` and `/close` draft through "Doc gaps", so none of them carries a pointer of its own. No agent preloads the standard yet: none in `.claude/agents/` edits files, and Decision 4 left a reviewer for later.

**Piece 6: Claude's memories** - `~/.claude/projects/-Users-sarah-repos-meal-planning/memory/`. Removes the memories the two shared-rule skills replace, each deleted with its line in `MEMORY.md`:
- In the step that builds Pieces 1 to 3: `docs-are-guides-not-rule-lists`, `restructure-for-readability` and `condition-before-instruction`.
- In the step that builds Piece 7: `docs-describe-codebase-not-agents` and `dont-repeat-agents-md`.

`describe-what-is-not-what-isnt` stays (Sarah's call).

**Piece 7: Rule placement** - `.claude/skills/rule-placement/SKILL.md`, with `user-invocable: false`. Says where a rule or convention lives, and how other files refer to it.
- Its description says when to use it: when deciding where a new or changed rule goes, or when writing a skill or agent that relies on a rule kept elsewhere.
- It takes in `/tooling` step 2's paragraph on where a rule goes: the docs in `docs/` describe the codebase itself, never how agents work; an agent rule only one skill uses goes in that skill (implied today, stated outright here, since that's where a task-specific rule like the 3-test-file threshold goes); one several skills or agents use, but that doesn't belong in every session, goes in a shared-rule skill that skills point to by name and agents preload with `skills:`; one every session needs goes in AGENTS.md.
- It takes in `/tooling` step 3's "AGENTS.md, the docs and shared-rule skills" bullet on how other files refer to a rule: when each place loads, a skill or agent never restates a rule kept in one of them and points to it by name instead, and a shared-rule skill holds only the shared rule, never which skills use it.
- A plain repeat of a rule kept elsewhere, including a procedure line such as "one at a time", is removed without asking Sarah. Only wording that differs from the rule gets the question of whether it's a deliberate exception or drift.
- It's written to the `writing-standard` skill, like any other agent instruction.

**Piece 8: `/infra-design`** - `.claude/skills/infra-design/SKILL.md`, step 4. Sends the Conventions step to `rule-placement`: in the sentence ending "names where it lands", the inline list and the reference to `/tooling` give way to a pointer, so it reads "...and names where it lands, as the `rule-placement` skill describes."

## The Flow
1. A session decides to draft or change a file in `docs/`, `README.md`, AGENTS.md, `.claude/skills/` or `.claude/agents/`.
2. If the change adds or moves a rule, the session first decides where it goes, as `rule-placement` describes. `/tooling` step 2 and `/infra-design` step 4 point it there. In any other session, the skill's description can prompt it.
3. In `/tooling`, step 3's pointer sends it to the standard. In any other session, the AGENTS.md "Docs" line does, and it's always in context. If a session with no skill misses that line, the skill's description can still prompt it.
4. It invokes `writing-standard`. `SKILL.md` loads with the core, then it reads `docs.md` or `instructions.md` for the kind of file it's changing, or both.
5. It drafts to the core and that part, shows Sarah the draft as AGENTS.md requires, and writes it once she approves.
6. A session that only reads these files is never pointed to the skill, so only its one-line description is in context.
7. After compaction, Claude Code reattaches an invoked skill, so the core stays. A part is read again if the session still needs it.
8. If a session skips the standard, its draft falls short and Sarah catches it in review. If that keeps happening, the reviewer agent or edit-gate hook that Decisions 2 and 4 left for later is the fix.

## Build Order
### Step 1: The writing standard
**Builds:** Pieces 1, 2 and 3, and Piece 6's first three memories
**Setup first:** none
**Implementer checks:**
- The description names when to use the skill: before drafting or changing a file in `docs/`, `README.md`, AGENTS.md, `.claude/skills/` or `.claude/agents/`, in the third person.
- The core holds every quality Piece 1 lists, each with its reason, and everything from `/tooling`'s "Writing instructions" and "Readable as a whole" bullets and the `restructure-for-readability` and `condition-before-instruction` memories.
- Nothing in `docs.md` or `instructions.md` overrides the core. Where they differ, the core states the principle and each part says how it applies.
- The core names no skill that uses it, and ends by naming the part to read for each kind of file.
- `docs-are-guides-not-rule-lists`, `restructure-for-readability` and `condition-before-instruction` are deleted from Claude's memory folder, with their `MEMORY.md` lines, and their content is in the standard.
**Sarah checks:** none
**Status:** ✅ Complete
**As built:** the core also opens with "Write for Your Reader", the principle Piece 3 says both parts apply, and `docs.md` gains "Prose by Default", saying how the core's list rule applies to docs. The planning rule at the end of `restructure-for-readability` (a plan step that adds to a doc says it does a readability pass) was dropped rather than moved in, since the standard now reaches the agent that builds the step (Sarah, 2026-10-06).

### Step 2: Rule placement
**Builds:** Piece 7, and Piece 6's last two memories
**Setup first:** none
**Implementer checks:**
- The description names when to use it: deciding where a new or changed rule goes, or writing a skill or agent that relies on a rule kept elsewhere.
- It holds everything from `/tooling` step 2's placement paragraph and step 3's "AGENTS.md, the docs and shared-rule skills" bullet, with the one-skill case stated outright and the plain-repeat rule from Piece 7.
- It follows the `writing-standard` skill.
- `docs-describe-codebase-not-agents` and `dont-repeat-agents-md` are deleted from Claude's memory folder, with their `MEMORY.md` lines, and their content is in the skill.
**Sarah checks:** none
**Status:** ✅ Complete
**As built:** the line in `docs-describe-codebase-not-agents` saying that an agent rule still being worked out waits in the Agent Workflow Changes note, not in Docs Updates, was left out of the skill. It's about which note holds pending work, not where a settled rule lives, and each collecting note's What Belongs Here section already covers that.

### Step 3: Pointers to the two skills
**Builds:** Pieces 4, 5 and 8, and the Convention on reviewing agents
**Setup first:** none
**Implementer checks:**
- `/tooling` step 2 points to `rule-placement`; step 3 points to `writing-standard` where it drafts; the "Writing instructions", "Readable as a whole" and "AGENTS.md, the docs and shared-rule skills" bullets are gone; the "New skills and agents" bullet carries the Convention on reviewing agents.
- AGENTS.md's "Docs" list has the `writing-standard` line, and "Doc gaps" → "Drafting it" no longer says "match the doc's existing style".
- `/infra-design` step 4 points to `rule-placement`, and no skill or agent still sends placement to `/tooling`.
- Goal 1, without a skill: a fresh headless session (`claude -p`, output with its tool calls) asked to draft, without writing, a short paragraph for `docs/unit_tests.md` on when to use `pnpm test:agent` invokes `writing-standard` and reads `docs.md`, not `instructions.md`, before its draft.
- Goal 1, in a skill: a fresh headless session running `/tooling` asked to draft, without writing, a one-sentence change to the `scope-router` agent's description invokes `writing-standard` and reads `instructions.md` before its draft.
- Goal 3: a fresh headless session asked "How are shared mocks set up? Read `docs/unit_tests.md` and tell me." answers without invoking `writing-standard`.
**Sarah checks:**
- [x] `/implement` gives you in chat the two drafts from the Goal 1 runs. Read the `docs/unit_tests.md` paragraph against `.claude/skills/writing-standard/SKILL.md` and `docs.md`, and the `scope-router` change against `SKILL.md` and `instructions.md`. See that each follows every quality there, not only reading as one piece. Goal: a draft follows the whole standard.
**Status:** ✅ Complete
**As built:** the `rule-placement` pointer in `/tooling` step 2 sits in the "where the change belongs" bullet, and the `writing-standard` pointer opens step 3, before the size split. In the first Goal 1 runs, the `docs/unit_tests.md` paragraph read well but was an agent rule, since `pnpm test:agent` exists only for agents, and the made-up `scope-router` change was redundant, since "planning" already covers `/infra-design`. So `docs.md` gained a paragraph at review (Sarah, 2026-10-06): a rule only agents follow doesn't go in a doc, and is placed as `rule-placement` describes. On the rerun, the doc request was declined and pointed to the AGENTS.md Commands entry, and the `scope-router` run drafted a real change (covering items from a tooling change, which has no story), which Sarah confirmed follows the standard. Goals 1 and 3 were proved by the Implementer checks' headless runs, Goal 2 by the Sarah check.

# Conventions
- **A reviewing agent preloads the standard.** An agent in `.claude/agents/` that reviews docs or agent instructions, such as a checker [[Docs Audit]] might add, loads `writing-standard` with `skills:` in its frontmatter, rather than restating the standard or pointing to it from its prompt. Lands in `/tooling` step 3, in the bullet on new skills and agents.

# Out of Scope
- Bringing the existing docs, including `README.md`, up to the standard: [[Docs Audit]].
- Slimming the existing agent instructions: the slimming pass in [[Agent Workflow Changes 2026-10-02]].
- Notes in `notes/`, their templates and Note Conventions.
