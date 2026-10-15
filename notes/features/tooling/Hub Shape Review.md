---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **Drafting a hub, from Feature Shape Review on 2026-10-14:** Sarah defined a hub as several independent stories that overlap substantially, so they need one shared place for their design and decisions. `/shape`'s step 4 now makes a hub only for such stories, which are known when it does. Its "Drafting a hub" section still drafts a hub made before its stories are known: the `^status` line is "Not split yet. Next: /decide" and Child Stories stays empty until decisions make them clear. This review reworks it so drafting a hub also creates each story's idea note, as a split does, and lists them in the hub. `/shape`'s step 7 also keeps a new hub's Roadmap line where it is, as uncommitted, while the Roadmap gives a hub a line only while it has open decisions, and a hub made this way may have none.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Hub's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `notes/templates/Hub.md`.

**Re-checks for this step:** `/shape`, the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `settling-a-decision` (reviewed in [[Feature Decide Review]]); `roadmap-placement`, `deleting-a-note` (reviewed in Shared Note Procedures Review); the `scope-router` agent and `filing-work` (reviewed in Scope-Router Review); `notes/templates/Idea.md` (reviewed in Feature Template Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-14]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **`/shape`'s hub drafting** (:84-93) moves to a supporting file.
- **Decision 14:** the Hub template's Build Order section and its Status and Blocked by columns go; `split-checker:37` ("Hubs are never archived") contradicts `/close` and Note Conventions; `split-checker:43`'s Build Order goes, and each child it creates embeds the hub's Purpose.
- **Copied status in notes:** moved from Agent Workflow Changes 2026-10-02, where it read: "**Notes copy a story's status instead of embedding it** - the Hub template's Child Stories table (`notes/templates/Hub.md:24`) has a Status column that each hub fills in by hand, so it goes stale as soon as a child moves on: CI Checks still listed CI Failure Sessions as `spec` after it had gone to `ready`. Where a note needs a child's status, it should embed the child's `^status` line (`![[<child>#^status]]`) instead of restating it, and a note shouldn't show a status at all where it doesn't add value. Check the templates, and the skills and agents that fill them in (such as `split-checker`, `/decide`, `/shape` and `/close`), for copied status, and settle with Sarah which places need one. Other hand-kept copies of a child's state, such as the hub's Blocked by column and the "(done)" markers in Build Order, may be the same problem. Sarah: 'If a hub or a stub needs to have a child's status it should be a link to the status rather than recreating it. And we shouldn't be linking status anywhere it doesn't add value.' Found 2026-09-30 during `/implement` on CI Failure Sessions Step 1." Decision 14 answers it for hubs; the other templates and skills still get the check it asks for.
- **`Hub.md`:** `:16`'s second half, `:22` and `:41` repeat `/decide`, `/close`, Note Conventions, `split-checker` and `filing-work`. The Coverage format (❓ for a gap) moves to `/decide`, which writes Coverage (`decide:102`).
- Wording difference at `Hub.md:38`: Open Decisions notes "any constraints existing stories already impose". Where the rule is kept: the story templates' Open Decisions comment doesn't. Exception or drift?
- `Hub.md:6` (found 2026-10-14 in the Feature template review): the prefilled `^status` line, "No direction yet.", names no next skill and links no blocker, as AGENTS.md requires, so `vault-lint` reports it. The story templates' same line became "Next: /shape", but a hub's next step differs.

# Questions
