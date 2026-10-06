---
type: infra
status: ready
confirmed: 2026-10-05
---
# Where It Stands
Design approved. Next: a one-off session for Step 1 (see Inbox), then /implement ^status

/infra-design wrote the Goals and the Design on 2026-10-05, with this story's own Build Order of four steps. It sets no Conventions and needs no Setup Outside the Repo. Nothing is built yet. Step 1 is built in a one-off plain session, since no skill builds a Build Order step until it lands, and `/implement` builds Steps 2 to 4. Sarah decided 2026-10-05 to build it once the [[Agent Workflow Changes 2026-10-02]] items that affect it are done, so its skill edits are written with them in place. "Tell what Sarah wants apart from what she only approved" is done, and "Skill and doc edits read as a whole" remains.

# Inbox
- For the one-off session that builds Step 1 of the Build Order, as Sarah decided 2026-10-05: no skill builds a Build Order step yet, so Sarah starts a plain session and asks it to build Step 1 of Infra Stories Without Steps, as this item says. The session reads this note and `.claude/skills/implement/SKILL.md`, and works as `/implement` would on a step, with three differences:
  - It finds Step 1 under `## Build Order` in `# Design`, not under `# Implementation`.
  - It shows Sarah the draft of each change to `/implement` and asks her to approve it, as AGENTS.md describes under "Approval covers the edits".
  - It ends with one table of the changed files, each a link with a one-line summary, and opens the Code tab's diff pane for the full diff.

  Once Sarah says Step 1 is done, it marks the step `**Status:** ✅ Complete`, sets `status` to `in-progress`, moves the story's Roadmap line into Now, sets the `^status` line to "In progress. Next: /implement", and deletes this item.
- For the session that builds Step 1 (Piece 4, `/implement` builds a Build Order step): AGENTS.md "Her decisions can change" now lets an agent change a choice Sarah only approved, such as the order of an approved Build Order, without asking first. It records the change, names it in its summary (with a bold ⚠️ line at the top if it's big), and the story stays `ready`. The Flow's "Building shows the Design or the Build Order doesn't hold" line and Piece 4's Re-plan bullet send every such case back to `spec` for `/infra-design`. Check with Sarah whether they should cover only what `/implement` can't change on its own, and update them to match. Added 2026-10-05 by `/tooling` on [[Agent Workflow Changes 2026-10-02]], when the "Tell what Sarah wants apart from what she only approved" item landed.

# Purpose
Sarah wonders whether `/plan-steps` is inappropriate for `infra` stories. It's built for small incremental work, which she does want for feature work, where she reviews the code to make sure it matches what she expects. For infra, such as wiring up a GitHub Actions routine, she just wants it to work. Part of her problem is how finicky the steps are.

# Goals
- [ ] Sarah's checks on an infra story prove that it works, not that its code matches what she expected.
- [ ] `/implement` asks Sarah to check an infra story only when a chunk reaches one of its Goals or needs something only she can do.
- [ ] Each check Sarah does on an infra story says exactly what to run, paste or open. Where that can only be known at build time, `/implement` gives it to her in chat, ready to paste.
- [ ] The Goals `/infra-design` writes name only what Sarah wants to get out of the story. Requirements that serve them, such as Notes Vault Repo's scripts working from a worktree, go in the Design, and the implementer checks those, not Sarah.
- [ ] Sarah approves an infra story's build order, in session-sized chunks, along with its Design, and no separate planning session follows.
- [ ] Notes Vault Repo, Dependency Release Analysis and Major Upgrade Sweeps are ready for `/infra-design` to replace their steps with a Build Order, and nothing that only their steps hold gets lost.

# Open Decisions
1. Should an infra story keep a step plan, just a much lighter one (for example a few session-sized chunks, each with its Setup and a Goal or two as its check)? Or should it skip steps entirely, so `/implement` builds straight from the approved Design with the Goals as checks? Every later infra story follows the answer. Found by /shape (2026-10-05).
   - **Decided 2026-10-05:** C: `/infra-design` adds a short Build Order to the Design, an ordered list of session-sized chunks that each name their Pieces, the Setup Sarah does first and the Goals checkable at the chunk's end. Sarah approves it with the rest of the Design, infra skips `/plan-steps`, and `/implement` builds one chunk per session and marks it ✅ Complete. It covers the three jobs steps did in a few lines, written by the session that already knows the Pieces, without a second planning session and checker that restate the Design.
     - Rejected: A, a lighter `/plan-steps` for infra - it still takes a separate session and checker run to write out the Design's order again, and it adds infra exceptions to plan-steps and plan-checker.
     - Rejected: B, no steps - the build order would be decided one session at a time without Sarah approving it, and agents without an ordered list written up front tend to build everything at once or stop early.

# Design
Questions for this section:
- Which infra notes that already have steps get the re-pass once the new path exists?
  - **Decided 2026-10-05:** all except [[Dependency Update PRs]], which is in progress and finishes on its current steps. So [[Notes Vault Repo]], [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]] get the re-pass. Sarah's call. [Sarah] - Also as part of this, I think the agent is defining goals too broadly. A goal should be the thing I personally want to get out of the story. The agent adds a lot of implementation details to it that always seem sensible, but I hesitate to call them a _goal_. For example, in Notes Vault Repo there is a goal which says "`vault-lint.sh`, `vault-orphans.sh`, `note-refs.sh` and `note-section.sh` work on the notes repo when run from the main checkout, from a worktree or in a routine." This seems like a good idea, and I think the story is right to include it. But if we'd achieved the same result a different way I wouldn't have cared. I certainly don't want to spend my time testing that it works.
- Do Sarah's checks have to cover a Design's failure paths (as Goals she checks), or does each Build Order chunk name failure paths the implementer verifies on its own?
  - **Decided 2026-10-05:** case by case. A failure path gets a check only where the Design already has one worth checking, and agents don't invent possible failure paths to fill one in. Sarah's call: she doesn't want agents twisting themselves into knots inventing failure paths.
- How does a Goal become an exact action Sarah can check?
  - **Decided 2026-10-05:** the same rule `/plan-steps` uses now (`.claude/skills/plan-steps/SKILL.md`, "usable as written"), moved into `/infra-design`: each Build Order check spells out the exact command, text or screen, and where that can only be known at build time, the check says `/implement` gives it to her in chat, ready to paste. `/implement` should also ask her to check a lot less than steps did. Sarah's call: `/infra-design` takes over `/plan-steps`' work here.

Every piece changes only the infra parts of the files it touches. Planning for feature, bug, pattern, cleanup, sweep and roundup stories stays as it is.

## Pieces
1. **The Goals rule** - `.claude/skills/infra-design/SKILL.md`, step 2. Goals name only what Sarah wants to get out of the story. A requirement that serves a Goal, however sensible, goes in the Design under the piece it belongs to, and the implementer checks it, not Sarah. It applies in a revision too, so the notes moving onto the new path get their Goals re-checked. The skill's example is Notes Vault Repo's Goal that the vault scripts work from a worktree.
2. **The Build Order step** - `.claude/skills/infra-design/SKILL.md`, a new step after Setup Outside the Repo, since each step names the Setup it needs. It writes `## Build Order` as the last part of `# Design`, in this format:
   ```
   ### Step 1: <title>
   **Builds:** Pieces 2 and 3
   **Setup first:** <a Setup Outside the Repo item, or none>
   **Implementer checks:** <requirements and failure paths from the Design that the implementer verifies on its own>
   **Sarah checks:**
   - [ ] Run `<command>`, see <result>. Goal: <which Goal it proves>.
   ```
   Its rules, mostly moved from `/plan-steps`: each step fits one session; each step's checks work with only what's built through that step; each piece of Setup goes in the first step whose checks need it; every Goal is reached by some step; each check is usable as written; and a failure path gets an implementer check only where the Design already has one. A step that reaches no Goal and needs nothing only Sarah can do has "Sarah checks: none". Decisions that come up while ordering go through the skill's Gaps process. Sarah approves the Build Order as a whole from an outline. The chunks are called steps so that `/final-review`'s ✅ search, `/close`'s check that every step is marked and `/check-drift`'s remaining steps keep working.
3. **The hand-off to building** - `.claude/skills/infra-design/SKILL.md`, steps 1 and 7. Once Sarah approves the Design with its Build Order, `status` goes to `ready` and the `^status` line to "Ready. Next: /implement". In a revision, steps marked ✅ Complete stay as they are, and only the remaining steps are re-ordered. Step 1's "`ready` or later: stop" still holds, since a ready story comes back only after `/check-drift` or `/implement` sets it to `spec`.
4. **`/implement` builds a Build Order step** - `.claude/skills/implement/SKILL.md`. For an infra story:
   - **Finding the step:** the first step under `## Build Order` with no Status line. Setup works as it does today.
   - **Checks:** it does the step's Implementer checks in its first pass, and asks Sarah only the step's Sarah checks. A step with "Sarah checks: none" asks her for nothing beyond approving drafts.
   - **Report:** one table, with each changed file as a link, a one-line summary of the change and any choice made in it, plus a link to the full diff (the Code tab's diff pane). No other tables, and no prompt to review the diff.
   - **Updating the note:** besides ticking the step's checks and adding ✅ Complete, it ticks each Goal in `# Goals` that the step's checks proved.
   - **Re-plan:** the story goes back to `spec` with "Next: /infra-design (revision)" instead of `/plan-steps`.
5. **Planning drops infra** - `.claude/skills/plan-steps/SKILL.md` and `.claude/agents/plan-checker.md`. Take out the Infra approach in step 1, "Setup outside the repo" in step 2, the infra kind of check, the infra review in step 4 and plan-checker's infra lines. Run on an infra note, `/plan-steps` says `/infra-design` writes its Build Order, and stops. The rules Piece 2 takes over stay here too, since other types still use them.
6. **Drift routes infra to `/infra-design`** - `.claude/skills/check-drift/SKILL.md`. For a `ready` or `in-progress` infra story, the remaining work is the Build Order steps with no Status line, plus the Design pieces they build. A finding that the steps no longer hold sends an infra story to `/infra-design` (revision) instead of `/plan-steps`.
7. **Final review reads the Build Order** - `.claude/skills/final-review/SKILL.md` step 2, and `.claude/agents/leftovers-checker.md`. For an infra story, the story's files come from `## Build Order`: the paths of the Pieces each step builds, plus its As built notes. The range still starts from the first ✅ Complete.
8. **The lifecycle** - `notes/Note Conventions.md`. Lifecycle: for infra, an approved Build Order is what makes a story `ready`. Next Step table: `infra · idea` moves to `ready` through `/infra-design`, and the `infra · spec` row becomes a revision by `/infra-design`, for a story sent back by `/check-drift` or a re-plan. Templates: the Infra description names the Build Order.
9. **The Infra template** - `notes/templates/Infra.md`. The Goals comment says Goals name only what Sarah wants to get out of the story, and requirements that serve them go in the Design. The Design comment says it ends with a `## Build Order` that `/infra-design` writes. `# Implementation` is removed.
10. **Boy Scout fixes in a Build Order** - `AGENTS.md`, "Out-of-scope work", the "Its steps are written" bullet. An unbuilt step's Boy Scout fix goes on its **Source:** line, or its **Builds:** line in a Build Order.
11. **Rollout** - [[Notes Vault Repo]], [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]] each get an Inbox item for `/infra-design`: replace the steps under `# Implementation` with a Build Order, after moving into the Design anything only the steps hold, named for each note, such as Notes Vault Repo's "Facts the steps rely on" and decisions made while planning. Those three and [[Vercel Deploy Errors]] lose this story from `blocked-by`, and each `^status` line becomes "Next: /infra-design (revision)", keeping any part about what building waits on. This is done here rather than by `/close`, which would send each note to `/check-drift` for having waited, when they waited on a workflow change, not on code. [[Dependency Update PRs]] stays as it is.

## The Flow
1. **`/shape` and `/decide`:** unchanged.
2. **`/infra-design`:** writes the Goals, the Design, Conventions, Setup Outside the Repo, then the Build Order. Sarah approves the Build Order as a whole. The story goes to `ready`, "Next: /implement".
3. **`/implement`, one session per Build Order step:** it takes the first step with no Status line, walks Sarah through any Setup the step names, builds it and does its Implementer checks. It asks her only the step's Sarah checks, and reports in one table with a link to the full diff. Once she says it's done, it ticks the checks and the Goals they proved, and marks the step ✅ Complete.
4. **After the last step:** `in-review`, then `/final-review`, then `/close`.

When something fails:
- **Building shows the Design or the Build Order doesn't hold:** `/implement` stops, the story goes back to `spec`, and `/infra-design` revises it, keeping the ✅ steps.
- **`/check-drift` finds the remaining steps or the Design no longer hold:** the same route, to `/infra-design` (revision).
- **A check fails:** handled inside the `/implement` session as today, fixed if it needs no decision, otherwise asked.

## Build Order
This story builds the path it would use, so Sarah decided 2026-10-05 that Step 1 is built in a one-off plain session, told what to do by the Inbox, and `/implement` builds the rest.

### Step 1: `/implement` builds a Build Order step
**Builds:** Piece 4
**Setup first:** none
**Implementer checks:** `/implement`'s steps for other story types read exactly as before.
**Sarah checks:** none

### Step 2: `/infra-design` writes Goals by the new rule, and a Build Order
**Builds:** Pieces 1, 2, 3, 8 and 9
**Setup first:** none
**Implementer checks:** Note Conventions' rows for other types are unchanged.
**Sarah checks:**
- [ ] When this `/implement` session reports, see that it asked you to check nothing beyond approving its drafts, and ended with one table of changed files and a link to the full diff. Goal: `/implement` asks only when a chunk reaches a Goal or needs something only Sarah can do.

### Step 3: The rest of the workflow follows Build Orders
**Builds:** Pieces 5, 6, 7 and 10
**Setup first:** none
**Implementer checks:** planning, drift and review for other types are unchanged.
**Sarah checks:** none

### Step 4: The waiting notes move onto the new path
**Builds:** Piece 11
**Setup first:** none
**Sarah checks:**
- [ ] In a new session, run `/infra-design Major Upgrade Sweeps`. See it re-check the Goals against the new rule, and write a Build Order whose Sarah checks each say exactly what to run, paste or open, and prove that something works. Goals: checks prove it works; checks usable as written; Goals name only what Sarah wants.
- [ ] In the same session, see that the note's old step was replaced by its Build Order, with the decisions from planning moved into the Design first, and that it ends "Ready. Next: /implement" with no `/plan-steps`. Goals: no separate planning session; nothing the old steps held is lost.

# Out of Scope
