---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **Two copies of the check on a leaning, from Feature Shape Review on 2026-10-14:** `answer-confidence`'s "Checking a leaning" and the new `settling-a-decision` skill's "Check" both say to send `decision-researcher` the user's hedged answer, and what to do when it finds problems or none. Feature Shape Review moved `/decide`'s step 3 into `settling-a-decision` as written, which made the copy visible. This review settles which skill keeps the check.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `answer-confidence`, `roadmap-placement`, and the procedures for creating an idea note and deleting a note. This review reads each one as Feature's `/shape` step uses it: it has to give that step what it needs and meet the writing standard. Later reviews re-check it for their own steps.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-3]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Creating an idea note** (`shape:97`, `decide:122`, `roadmap:67`, `tooling:41-44`) restates defaults the Idea template already sets (`type` blank, "Next: /shape"). Cut each to "from `notes/templates/Idea.md`".
- **Deleting a note and its orphaned files** (`note-refs.sh`, `rm`, the Roadmap line, the links, the release check, `vault-orphans.sh`) is kept in `close:44,106,114`, `shape:104,108,129` and `tooling:84-87,93`. `tooling:86` sends the agent into `/close`'s file for one rule. It becomes a shared-rule skill.
- **`answer-confidence`:** checking a Leaning line: the same paragraph is at `infra-design:51`, `investigate:39`, `assess:32` and `architect:43`. It says not to use `decision-researcher`, while `answer-confidence:16` says `decision-researcher` does the check. It goes into `answer-confidence`, which leaves who checks to each skill.
- **`answer-confidence`:** a gap answered on the spot, and the Decided/Rejected format: `infra-design:57-60` and `architect:55-58` are near copies, and both send the agent to read all of `/decide` for the format at `decide:81-87`. It goes into `answer-confidence`'s Recording section.
- **`answer-confidence`:** parking a decision for `/decide` (an Open Decisions question, one `decision needed` entry, "Next: /decide"): `shape:147`, `investigate:84,98`, `decide:105`, `assess:49`, `architect:36`, `plan-steps:133`. It goes into `answer-confidence`.
- **`answer-confidence`:** "Her comments may already answer it": `decide:28`, `investigate:27`. It goes into `answer-confidence`.
- **`answer-confidence`:** :13 has no reason and stands apart from the Hedged case; :10 says one thing twice.
- **`answer-confidence`:** :21 follows decision 3 (an answer is the user's call only with their own reason). AGENTS.md's side of decision 3 is in [[AGENTS.md Review]].
- **`answer-confidence` and `roadmap-placement`:** their descriptions list the skills that use them; descriptions load into every session, and the lists are already stale.
- **`roadmap-placement`:** :14-16, two plausibility bullets, merge; the compelling-case rule (:18, :24) is stated twice, with a pointer to a section that doesn't hold it and no reason; :8 lists every goal-note section to read, and names `/tooling`; :20 packs four alternatives into one sentence with no reason; :21, :30 and :36 restate the Roadmap; :26 doesn't earn its place.
- Wording difference at `answer-confidence:25` (with `decide:87` and `architect:58`): Rejected lines only for options she named and turned down. Where the rule is kept: the rule kept elsewhere is one Rejected line per option she considered, or turned down. Exception or drift?
- Wording difference at `infra-design:60` and `decide:78`: print the Decided line in chat and go on. Where the rule is kept: AGENTS.md "Approval covers the edits" says list it in the summary. Exception or drift?

# Questions
