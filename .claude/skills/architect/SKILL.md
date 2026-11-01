---
name: architect
description: Writes a pattern note's Rules, an Enforcement for each rule and an audited Migration Checklist with the user. Use when a pattern note's next step is /architect.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Write the Rules, Enforcement and Migration Checklist for the pattern note **$ARGUMENTS**. `/plan-steps` writes its implementation steps later.

## Why This Skill Works the Way It Does
A pattern note introduces a convention ("everything should work this way") and moves the existing code over to it. Once the convention exists, agents check code against its Rules, and `/plan-steps` turns its Migration Checklist into steps. So this skill's output has to hold up in two ways:
- **Rules an agent can check.** A rule that needs judgment to apply ("keep barrels clean") gets applied differently every time.
- **A checklist that's complete.** Pattern notes usually arrive with a Migration Checklist that was written while the problem was found and is marked "not a full audit". This skill calls it the starting list. A migration planned from that list leaves violations behind, and later code copies them. So the full list comes from the `rule-auditor` subagent, which searches the code against the approved Rules.

## 1. Read the Note
Find the note in `notes/features/` and read all of it. Also read each linked note that its Rules or Open Decisions depend on.

Check that it's ready for this skill:
- **`type: pattern` and `status: idea`.** If `type` is blank, the next step is `/shape`.
- **`status: spec`:** its Rules were already approved.
  - **If the note says it's due a revision,** such as its `^status` line naming `/architect` or an Inbox item asking for one, it's a revision.
  - **Otherwise,** ask the user whether this is a revision. If it isn't, stop.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.
- **No open decisions.** The note isn't ready if it has a `decision needed` entry in `blocked-by`, or an item under `# Open Decisions` with no **Decided** line. An item with only a **Partly answered** line still counts as open. List the open decisions, one line each, tell the user the next step is `/decide <note name>`, and stop.

Then read the Rules of every other `type: pattern` note in `notes/features/`, so you can spot overlaps and conflicts.

**In a revision,** the Inbox item, `^status` line or user's answer that called for it names what to rework. Each step below works only on the rules it reworks, with their enforcements and checklist items, and every other rule, enforcement and checklist item keeps its approval as written. Show each reworked piece next to the version it replaces before writing it.

## 2. The Convention
Every rule follows from the convention, so settle it before drafting any rule. A convention says what code should do, not just what's wrong with it today. A note that only describes the problem or asks for the right fix, such as "these are all bad the same way, help me find the right solution", hasn't chosen one. If no **Decided** line or comment from the user says what code should do, write the question of what the convention should be under `# Open Decisions`, and settle it as the `settling-a-decision` skill describes.

## 3. Rules
### Draft
Draft every rule before showing any, so you can see where rules overlap or should split before the user approves one. Sources, in order of authority: the user's comments, **Decided** lines, then Purpose and Symptoms. Don't write rules for cases no story has asked for yet, because a rule stretched to them can bind later work in ways nobody chose.

Text already under `# Rules` is one of these:
- **In a revision, rules approved in an earlier run:** keep each one as it is, unless the revision reworks it.
- **Questions for this step:** each one is something a rule has to settle. If the sources settle it, answer it in the rule. Otherwise, it's a gap (below).
- **Other text marked as decided or approved:** keep it as the rule, and check it against the code and the other rules like any draft.
- **Anything else:** treat it as a draft.

Each rule has:
- **One convention.** If the rule needs "and" to join two requirements that can be broken separately, it's two rules.
- **A check.** Someone reading one file, or one import line, can say whether it follows the rule. Where the rule turns on a judgment ("domain-specific", "shared"), the rule gives the test for that judgment.
- **Examples from this codebase.** One place that follows it and one that breaks it, each with `file:line`, when both exist.
- **Where it lands.** The doc and section in `docs/` it goes into once built. The note holds it only until then.

Check each draft against the project docs and the other patterns' Rules. A rule that contradicts a doc or another pattern is a question for the user, not something to reconcile yourself.

### Gaps
Where the sources don't settle something a rule needs, don't fill it in. Settle it with the user as the `settling-a-decision` skill describes.

### Approve
Show each rule you drafted with its examples and where it lands, and wait for the user to approve or change it. If a change affects a later rule, say which one and update that rule's draft before you show it.

Once every rule is approved, write them under `# Rules` as `## Rule N - <short name>`, replacing the questions for this step. Write them now, before Enforcement, so they survive if the session ends.

## 4. Enforcement
Every rule needs something that stops future code drifting from it. For each rule, propose the strongest mechanism that works, in this order:
1. **A type** that makes the wrong code fail to compile.
2. **A lint rule** in Biome.
3. **A test** that checks the code itself, such as a conventions test that scans imports.
4. **A build error** that already exists, such as `server-only` failing `pnpm build`. Say which command catches it and whether it runs before every commit.
5. **Process only,** when nothing above can catch it: the rule in the project docs, which the planning and review agents read.

When the right mechanism isn't clear, settle it with the user as for a gap in step 3.

Show each rule's enforcement with why nothing stronger works. Once all are approved, write them under `# Enforcement`, one entry per rule, naming the rule by number.

## 5. Migration Checklist
A rule can change during this step. If one does, check that its Enforcement still catches what it now covers, and show any change to the Enforcement along with the rule.

### Audit
Send the `rule-auditor` subagent the approved Rules as written in the note. Don't send the note path or the starting list, so the audit isn't anchored to the starting list.

**Unclear rules.** If the auditor reports a rule it couldn't apply without judgment, the rule isn't checkable yet. Show the user what it was unsure about, sharpen the rule with them, update the note, and send that rule to the auditor again.

### Merge
Every place the auditor found goes in, with its `file:line`. For each item only in the starting list, work out why:
- **Forward-looking on purpose,** such as code another story is about to change: keep it, in its own group.
- **Already fixed, or never broke the rule:** a question for the user.

Then add the items that don't come from violations:
- **Enforcement:** each type, lint rule or test to add.
- **Docs:** each rule, in the doc and section it lands in.

Group the items by kind, as checkboxes.

Then triage the out-of-scope list. If the user pulls an item into the story, how it joins the checklist depends on the Rules:
- **If it breaks one of the approved Rules:** add it.
- **If it breaks none:** change a rule with the user so it covers the item, because the checklist only migrates code to the Rules, and a fix no rule covers has nothing to stop it coming back. Then update the note and send that rule to the auditor again, as for an unclear rule.

### Approve
1. **The checklist as a whole.** Show it grouped, with the number of items in each group. This is information, not an approval.
2. **Each question:** each one the merge turned up, and each place that looks like a deliberate exception to a rule. If the user decides a place is a deliberate exception, update the rule in the note: change the rule, or name the exception in it.
3. **The finished checklist.** Ask whether it's complete.

Write it under `# Migration Checklist`, replacing what was there.

## 6. Update the Note's Status
- Set `status` to `spec`.
- Set `confirmed` to today, since the user approving the Rules confirms the note.
- Update the `^status` line: the Rules are approved, and the next step is `/plan-steps`.

## 7. Stop
Route the out-of-scope list. Then tell the user the next step is `/plan-steps <note name>` in a new session, and stop.
