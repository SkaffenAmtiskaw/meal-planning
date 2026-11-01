---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **Add a route for a feature with nothing visual to design** - the Next Step by Note State table sends every `feature` · `idea` to `/design-feature`, then `/place-design`, and the paragraph under the table says the same. Neither covers a feature with nothing visual to design. The table needs a row, or the `feature` · `idea` row needs a second route, for a new feature that skips both: `/shape` writes it at `status: spec` with its behavior under Requirements, and its `^status` line says `Next: /assess`. `/shape` step 5 ("Next step") takes its next step from the table and gives only the design-session example, so it needs to offer this route when no part of the feature is visual. Sarah decided that [[Meal Color from Name and Description]] takes this route. Found 2026-10-31 while running /shape on the meal color Roadmap line.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Full review here:** `notes/Note Conventions.md`, and the top of `notes/Roadmap.md` (its header lines and "How this file works"). Every workflow review before this one re-checked it for its own step; this review looks at it as a whole, knowing every step's needs.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-2]]

![[Agent Instructions Audit#^decision-14]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 2:** Note Conventions stops loading through `paths`: the `.claude/rules/note-conventions.md` symlink and its `paths` frontmatter go, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to it. [[Notes Vault Repo]]'s Inbox has an item about where its new home goes.
- **The Roadmap's line 1** ("These should ALWAYS be planned and implemented individually …") is deleted, by Sarah's answer 2026-10-06, since sweeps, roundups and goal releases build items together. **Line 3** ("DO NOT delete this file …") is reworded without capitals and with its reason.
- **Note Conventions:46-69:** the Next Step table's padding (about 1,300 tokens); rows 48, 49 and 64 describe how a skill works rather than what it produces, and become a short "produces X" (`rule-placement` says Note Conventions is only a map).
- **The collecting workflow note and the kicked-off copy** are described at Note Conventions:37 and :65, Roadmap:28, `tooling:11` and `roadmap:21`; the definition stays at :37, trimmed, and the mechanics stay with `/tooling` and `/roadmap`.
- **The standing goal** is defined at Note Conventions:41, Roadmap:10 and `Standing Goal.md:5`; Note Conventions keeps it.
- **Infra** is described at Note Conventions:22, :33 and row 58; :33 keeps it.
- **Note Conventions:39** ("It holds no priority; goals do") repeats Roadmap:22. **:22** puts "**not**" in bold.
- **Note Conventions:1-6:** the `paths` frontmatter goes (decision 2); the comment's last sentence, which says where the rules for editing notes live, stays as body text pointing to `editing-notes`.
- **Hubs** in Note Conventions follow decision 14.
- **Roadmap:24:** the status list leaves out `dropped` and repeats Note Conventions:8; it goes.
- **Roadmap:25** and AGENTS.md:61 both describe the status embed, worded differently ("except a goal's"); the Roadmap keeps it and AGENTS.md points there.
- **Roadmap:28** repeats :14 (the collecting note's line sits in Unaffiliated). **:27** points to AGENTS.md, which points to `roadmap-placement`; it points there directly. **:11** ("Keep this to 2-3 items") has no reason.

# Questions
