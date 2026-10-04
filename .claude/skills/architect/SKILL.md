---
name: architect
description: Turn a pattern note's settled decisions into numbered Rules, an Enforcement for each rule and a full, audited Migration Checklist, approved with Sarah. Moves the note from idea to spec, ready for /plan-steps.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Write the Rules, Enforcement and Migration Checklist for the pattern note **$ARGUMENTS**.

## Why this skill works the way it does
A pattern note introduces a convention ("everything should work this way") and moves the existing code over to it. Once the convention exists, agents check code against its Rules, and `/plan-steps` turns its Migration Checklist into steps. So this skill's output has to hold up in two ways:
- **Rules an agent can check.** A rule that needs judgment to apply ("keep barrels clean") gets applied differently every time. Each rule has to be specific enough that someone reading one file can say whether it follows it.
- **A checklist that's complete.** Pattern notes usually arrive with a starting list, written while the problem was found and marked "not a full audit." A migration planned from that list leaves violations behind, and later code copies them. So the full list comes from the `rule-auditor` subagent. It searches the code against the approved Rules only and never sees the note's starting list, so it doesn't anchor on it.

This skill starts after the thinking is done. `/shape` gave the note its type and direction, and `/decide` settled its open decisions. Don't design new behavior or write implementation steps here. Steps are `/plan-steps`' job.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## Talking with Sarah
- **Build from her decisions.** Build the rules from her comments and the **Decided** lines under Open Decisions.

## 1. Read the note
Find the note in `notes/features/` and read all of it. Read the notes it links to when the Rules, Root Cause or Open Decisions depend on them. If the Inbox has a retype line, follow the `retyping-a-note` skill's "After a retype".

Check that it's ready for this skill:
- **`type: pattern` and `status: idea`.** If `type` is blank, the next step is `/shape`. If it's another type, check whether that type fits the work. If it doesn't, offer to retype the note, as AGENTS.md describes under "Editing notes". If it does, tell Sarah which skill the note needs, and stop.
- **`status: spec`:** its Rules were already confirmed. Ask Sarah whether this is a revision. If it is, work through steps 2 to 5 as usual, but show what changed compared with the existing sections before replacing each one.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.
- **No open decisions.** An item under `# Open Decisions` with no **Decided** line (a **Partly answered** or **Leaning** line still counts as open), or a `decision needed` entry in `blocked-by`, means the note isn't ready. List them in one line each, tell Sarah the next step is `/decide <note name>`, and stop.
- **A chosen convention.** A **Decided** line or a comment from Sarah has to say what the convention is, not just what's wrong with the code today. If the note only describes the problem, or asks what the right fix is ("these are all bad the same way, help me find the right solution"), the convention hasn't been chosen, even when no decision is formally listed. Don't choose one while drafting rules. Draft the question, such as "What convention should modals follow to separate presentation from data?", show it to Sarah and, once she approves, add it to `# Open Decisions`, with a `decision needed` entry in `blocked-by` if the note doesn't have one. Then tell her the next step is `/decide <note name>`, and stop.

Then read the project docs the convention touches: `docs/project_conventions.md` and `project_structure.md` always, and `unit_tests.md` when the rules touch tests or mocks. Also read the Rules of every other `type: pattern` note in `notes/features/`, so you can spot overlaps and conflicts.

## 2. Rules
### Draft
Draft every rule before showing any. Sources, in order of authority: Sarah's comments, **Decided** lines, then Purpose, Root Cause and Symptoms. Text already under `# Rules` is one of three things:
- **Questions for this step:** each one is something a rule has to settle. If a question has a **Decided** line under it, that's Sarah's answer. If it has a **Leaning** line, check it as part of this step's own work, not with a separate `decision-researcher` run, for the problems the `answer-confidence` skill lists under "Checking a leaning". If you find none, use her answer. If you find any, show her each one, and go on as that skill describes. Otherwise, if the decisions settle it, answer it in the rule. If they don't, it's a gap (below).
- **Text marked as decided or approved:** confirm with Sarah that it still holds rather than redrafting it.
- **Anything else:** treat it as a draft.

Each rule:
- **One convention.** If the rule needs "and" to join two requirements that can be broken separately, it's two rules.
- **Checkable.** Someone reading one file, or one import line, can say whether it follows the rule. Where the rule turns on a judgment ("domain-specific", "shared"), give the test for that judgment in the rule itself.
- **Examples from this codebase.** One place that follows it and one that breaks it, each with `file:line`, when both exist.
- **Where it lands.** The doc and section it goes into once built, usually a section of `docs/project_conventions.md`. Rules end up there. The note only holds them until then.

Check each draft against the project docs and the other patterns' Rules. A rule that contradicts a doc or another pattern is a question for Sarah, not something to reconcile yourself.

### Gaps
Where the decisions don't settle something a rule needs, don't fill it in:
- **She can answer it on the spot** (a scope boundary, a naming choice): ask her, and read her answer as the `answer-confidence` skill describes. If it's hedged, send `decision-researcher` the note path, the question and her answer as a check, save its report to `.scratch/<note name> - decision <N>.md`, and show her any problems it finds before you use her answer.
- **It needs research** (which library feature, what best practice says): send the `decision-researcher` subagent the note path and the question, with the answers she's given this session. Save its brief to `.scratch/<note name> - decision <N>.md`, walk her through the options and recommendation, and record her answer under `# Open Decisions` in the format the `/decide` skill uses (a **Decided** line plus one **Rejected** line per option she turned down). If she answered confidently, write the entry right away, print the Decided line in chat and go on without waiting for approval. Otherwise, show the entry and wait for her approval before writing it.

### Approve
Show each rule with its examples and where it lands, and wait for her to approve or change it. If a change affects a later rule, say which one and update it before you get to it.

Once every rule is approved, write them under `# Rules` in the note as `## Rule N - <short name>`, replacing the template comment and the list of questions for this step. Write them now, before Enforcement, so they survive if the session ends.

## 3. Enforcement
Every rule needs something that stops future code drifting from it. For each rule, propose the strongest mechanism that works, in this order:
1. **A type** that makes the wrong code fail to compile.
2. **A lint rule** in Biome. Check what it can express as AGENTS.md describes under "Library APIs". Any change to `biome.jsonc` is a project config change, and Sarah's approval of this enforcement is the explicit instruction to make it. Say so when you propose it.
3. **A test** that checks the code itself, such as a conventions test that scans imports.
4. **A build error** that already exists, such as `server-only` failing `pnpm build`. Say which command catches it and whether it runs before every commit.
5. **Process only,** when nothing above can catch it: the rule in the project docs, which the planning and review agents read. Say why.

When the right mechanism isn't clear, send `decision-researcher` the question, the same way as a gap in step 2.

Show each rule's enforcement with why nothing stronger works. Once all are approved, write them under `# Enforcement`, one entry per rule, naming the rule by number.

## 4. Migration Checklist
### Audit
Send the `rule-auditor` subagent:
- the approved Rules, as written in the note
- the approved Enforcement, so it knows what a lint rule or test will catch later
- the directories the rules apply to, if the rules say

Don't send the note path or the existing Migration Checklist. The audit is only useful if it isn't anchored to the starting list.

Save its report to `.scratch/<note name> - audit.md`. The auditor never sees the note, so it lists everything no rule covers under "Outside these rules", including work the story needs. Sort each item against the note's Purpose. If the story needs it to meet its Purpose, it's part of the story, as AGENTS.md describes under "Out-of-scope work", so keep it for the checklist. Otherwise, add it to your out-of-scope list.

**Unclear rules.** If the auditor reports a rule it couldn't apply without judgment, the rule isn't checkable yet. Show Sarah what it was unsure about, sharpen the rule with her, update the note, and send that rule to the auditor again.

### Merge
Compare the audit with the note's existing checklist:
- **Found by both:** keep, using the auditor's `file:line`.
- **Found only by the auditor:** add.
- **Only in the note:** work out why. Some are forward-looking on purpose, such as code another story is about to change. Those stay, in their own group. Others are already fixed, or never broke the rule. Those are a question for Sarah.

Then add the items that don't come from violations:
- **Enforcement:** each type, lint rule or test to add.
- **Docs:** each rule, in the doc and section it lands in.
- **Tests and mocks:** tests and shared mocks in `test/mocks/` that must change when the code they cover moves, as "Creating Centralized Mocks" in `docs/unit_tests.md` describes.
- **Work the story needs:** each "Outside these rules" item you kept for the checklist during the audit.

Group the items by kind, as checkboxes with file paths and line numbers. Put a line under the heading saying when it was audited: `*Audited YYYY-MM-DD by reading code.*`

Then triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes a checklist item. If it breaks none of the approved Rules, a rule has to change first: sharpen it with her as for an unclear rule, update the note, and send that rule to the auditor again.

### Approve
1. **The checklist as a whole.** Show it grouped, with the number of items in each group, and link the audit report. This is information, not an approval.
2. **Each question.** Items only in the note that the audit didn't find. Places that look like deliberate exceptions to a rule. Groups that look like more than one story's worth of work. For an exception, the answer changes the rule or adds an exception to it, so update the rule in the note once she decides.
3. **The finished checklist.** Ask whether it's complete.

Write it under `# Migration Checklist`, replacing what was there.

## 5. Update the note's status
- Set `status` to `spec`. The note isn't `ready` until `/plan-steps` has written its steps.
- Set `confirmed` to today. Sarah writing the rules counts as confirming the note.
- Update the `^status` line as AGENTS.md describes under "Editing notes": "Rules approved. Next: /plan-steps", or what building waits on if `blocked-by` names another story.

## 6. Find a home for out-of-scope items
If the out-of-scope list is empty, skip to step 7.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 7. Stop
Tell Sarah the Rules, Enforcement and Migration Checklist are written, and that the next step is `/plan-steps <note name>` in a new session. `/plan-steps` also checks whether the migration is really several stories. Don't start planning in this session. It deserves a fresh context.
