---
type: 
status: idea
confirmed: 2026-10-04
---
# Where It Stands

Next: /shape ^status

# Inbox
- The planned `dependency-updates` routine from [[Local Dependency Update Alerts]] (designed 2026-10-04, building doesn't wait on this story) adds lines to two sweep notes in the vault, Library Upgrades and Dev Tool Upgrades, by committing them on its dependency PR's branch in the code repo. Once the notes move, its skill (`.claude/skills/dependency-updates/SKILL.md`) has to send those lines to the notes repo instead, and the routine on claude.ai needs the notes repo added to its repositories (recorded in `.claude/skills/dependency-updates/routine.md`). Added from `/infra-design` on Local Dependency Update Alerts, where Sarah asked that the routine not be overlooked.

# Notes
Split from [[Branching and Releases]]. Moves the notes vault out of the code repo into its own git repo, so notes are never branched. Branching and Releases waits on it. From that story's Open Decisions:
- Decision 2: "**Decided 2026-10-04:** the notes vault moves to its own git repo, in a folder beside the code repo (outside its checkouts). Obsidian points at it, every session reaches it through Claude Code's `additionalDirectories` setting, and notes are never branched. Sarah's call after research: one copy of every note keeps Obsidian and the Roadmap current while story branches are open, and it works with worktree isolation, which blocks a worktree session from editing the main checkout."
- Decision 7: "**Decided 2026-10-04:** its own story, which this story waits on. Sarah's call, checked against the code and notes: the move rewrites about 30 files (mostly skills, agents and scripts, plus AGENTS.md and `docs/project_structure.md`) and needs setup outside the repo, too big for this story or one `/tooling` session."

Goal moved from Branching and Releases (Sarah's call, 2026-10-04), for `/shape` to make one of this story's goals: "The notes vault and the Roadmap stay consistent while work happens on more than one branch."

Findings from `/decide` on Branching and Releases (2026-10-04):
- **What the move changes:** about 115 `notes/` references across 30 files, outside `notes/` and `.opencode/`. Most are path swaps. These need new logic:
  - the git commands in `scripts/vault-lint.sh`, `scripts/vault-orphans.sh` and `.claude/agents/note-drift-checker.md`, `/check-drift`'s `git blame`, and `/final-review`'s commit range
  - `.claude/hooks/notes-only-edits.sh`'s `$CLAUDE_PROJECT_DIR/notes/` check, which 11 planning skills register
  - the `.claude/rules/note-conventions.md` symlink
  - commits that now go to two repos (`/tooling`, AGENTS.md "Git and files")
  - `.gitignore`'s `/notes/.obsidian/` line
- **Setup outside the repo:** a new GitHub repo, the Claude GitHub App's access to it, the routines' repo selection, and the Obsidian vault pointed at the new folder.
- **How every session reaches the notes repo:**
  - A folder in `permissions.additionalDirectories` in a settings file is open to every session with no prompt per session, and edits there follow the session's permission mode. In the tracked `.claude/settings.json`, it takes effect once Sarah accepts the workspace trust dialog, which covers the main checkout and its worktrees; each worktree reads its own copy of that file. Such a folder grants file access only, so no CLAUDE.md or skills load from it. Source: code.claude.com/docs/en/permissions, "Working directories".
  - Not yet confirmed: whether the path can be relative, and that it works in a worktree session. Test both before building.
  - A relative path resolves from each checkout, so if worktrees live at a different depth it points at the wrong folder. Pick a path form that doesn't depend on where Branching and Releases puts worktrees, and test it in a throwaway desktop-app worktree, or state the constraint it puts on that story's "where does a worktree live" question.
  - Unverified idea: a gitignored `notes` symlink to the new folder, if worktree isolation allows it, could keep most path strings as they are.
- **`/final-review` breaks as soon as the notes leave:** it finds a story's code range from the note's own git history (the first commit that marks a step ✅, then its parent), and that commit won't be in the code repo. Branching and Releases changes the range again for story branches, so a range method that also works with story branches avoids doing it twice.
- **Keeping the notes' git history:** a fresh repo makes every line look added on the day of the move. `/check-drift` would treat every [Sarah] comment as new since `confirmed`, and `note-drift-checker`'s `git log --since=<confirmed>` would list every note.
- **The notes repo's push rules** are this story's call. Branching and Releases' decision 3 (all work reaches `develop` through a PR) covers only the code repo.
- **Stories in flight:** if [[Manual and Agent Test Environment]] is still open when the move lands, its note moves mid-story. Before the move, check that its git stash ("Manual and Agent Test Environment Step 1: ...") holds no `notes/` files, or popping it would recreate `notes/` in the code repo.
- **Notes that quote `notes/` paths** get name-only corrections: three tech-debt notes at their "Note:" lines, the Hub template path in [[Agent Workflow Changes 2026-10-02]], and [[Docs Updates]].

# Questions
