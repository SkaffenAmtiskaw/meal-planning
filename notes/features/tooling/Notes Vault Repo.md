---
type: infra
status: idea
blocked-by:
  - "decision needed: where the notes repo's workflow instructions live, and how notes get committed and pushed"
confirmed: 2026-10-04
---
# Where It Stands

Next: /decide ^status

Shaped 2026-10-04 as one infra story. Two decisions are open for /decide: where the instructions for working with the notes repo live, and how notes get committed and pushed. After that, /infra-design writes the Design, Conventions and Setup Outside the Repo.

# Inbox
- For /infra-design, findings from /decide on [[Branching and Releases]] (2026-10-04):
  - **What the move changes:** about 115 `notes/` references across 30 files, outside `notes/` and `.opencode/`. Most are path swaps. These need new logic:
    - the git commands in `scripts/vault-lint.sh`, `scripts/vault-orphans.sh` and `.claude/agents/note-drift-checker.md`, and `/check-drift`'s `git blame`
    - `.claude/hooks/notes-only-edits.sh`'s `$CLAUDE_PROJECT_DIR/notes/` check, which 11 planning skills register
    - the `.claude/rules/note-conventions.md` symlink
    - commits that now go to two repos (`/tooling`, AGENTS.md "Git and files")
    - `.gitignore`'s `/notes/.obsidian/` line
  - **Setup outside the repo:** a new GitHub repo, the Claude GitHub App's access to it, the routines' repo selection, and the Obsidian vault pointed at the new folder.
  - **Keeping the notes' git history:** a fresh repo makes every line look added on the day of the move. `/check-drift` would treat every [Sarah] comment as new since `confirmed`, and `note-drift-checker`'s `git log --since=<confirmed>` would list every note.
  - **Stories in flight:** if [[Manual and Agent Test Environment]] is still open when the move lands, its note moves mid-story. Before the move, check that its git stash ("Manual and Agent Test Environment Step 1: ...") holds no `notes/` files, or popping it would recreate `notes/` in the code repo.
  - **Notes that quote `notes/` paths** get name-only corrections: three tech-debt notes at their "Note:" lines, the Hub template path in [[Agent Workflow Changes 2026-10-02]], and [[Docs Updates]].

# Purpose
Move the notes vault out of the code repo into its own git repo, so notes are never branched. Split from [[Branching and Releases]], which waits on it. That story decided 2026-10-04 that the vault moves to its own git repo in a folder beside the code repo (outside its checkouts), that Obsidian points at it, that every session reaches it through Claude Code's `additionalDirectories` setting, and that notes are never branched.

# Goals
- [ ] The notes vault and the Roadmap stay consistent while work happens on more than one branch.
- [ ] The vault lives in its own git repo outside the code repo's checkouts, and Obsidian, every Claude Code session (worktree sessions included) and the routines reach it.
- [ ] The notes' git history carries over, so `/check-drift`, `note-drift-checker` and `git blame` still see when each line changed.
- [ ] Every skill, agent, hook, script and doc that works on notes works against the new repo, and no `notes/` folder is left in the code repo.
- [ ] The planned `dependency-updates` routine from [[Major Upgrade Sweeps]] sends its lines for the Library Upgrades and Dev Tool Upgrades sweeps to the notes repo instead of committing them on its dependency PR's branch: its skill (`.claude/skills/dependency-updates/SKILL.md`) changes, and the routine on claude.ai gets the notes repo added to its repositories (recorded in `.claude/skills/dependency-updates/routine.md`).

# Open Decisions
1. Where do the instructions for working with the notes repo live: the skills, agents, hook, scripts and Note Conventions symlink that describe the vault, which today all sit in the code repo?
   - [Sarah] - I have concerns about agent instructions in the `meal-planning` repo containing instructions for how to interact with a different repo (the `notes` repo). As part of the planning for this story I want to work through how to handle this.
   - Candidates: keep them in the code repo and point them at the notes repo; move some or all into the notes repo; package them another way, such as a Claude Code plugin or user-level skills. A folder added through `additionalDirectories` grants file access only, so no CLAUDE.md or skills load from it.
2. How do changes to the notes get committed and pushed, and what are the notes repo's push rules?
   - [Sarah] - If the repo is now an Obsidian vault and nothing else, then I'd like to use the Obsidian git plugin which automatically updates. But I want to have a second opinion if there might be any undesirable side effects to using it.
   - **Leaning 2026-10-04:** the Obsidian Git community plugin, unless there's a very good reason it can't be used. Not checked yet.
   - Branching and Releases' decision 3 (all work reaches `develop` through a PR) covers only the code repo. The answer also shapes the notes' git history, which `/check-drift` and `note-drift-checker` read.

# Design
Questions for this section:
- What is the notes repo called, and where does its folder live?
  - **Decided 2026-10-04:** the folder is `~/repos/meal-planning-notes`, with a GitHub repo of the same name. Sarah's call.
- How does the `additionalDirectories` entry point at the notes folder so it works in every checkout, worktree sessions included? Findings from /decide on Branching and Releases (2026-10-04):
  - A folder in `permissions.additionalDirectories` in a settings file is open to every session with no prompt per session, and edits there follow the session's permission mode. In the tracked `.claude/settings.json`, it takes effect once Sarah accepts the workspace trust dialog, which covers the main checkout and its worktrees; each worktree reads its own copy of that file. Source: code.claude.com/docs/en/permissions, "Working directories".
  - Not yet confirmed: whether the path can be relative, and that it works in a worktree session. Test both before building.
  - A relative path resolves from each checkout, so if worktrees live at a different depth it points at the wrong folder. Pick a path form that doesn't depend on where Branching and Releases puts worktrees, and test it in a throwaway desktop-app worktree, or state the constraint it puts on that story's "where does a worktree live" question.
  - Unverified idea: a gitignored `notes` symlink to the new folder, if worktree isolation allows it, could keep most path strings as they are.
- How does `/final-review` find a story's code range once the notes are in another repo? Today it uses the first commit that marks a step ✅ in the note, then its parent, and that commit won't be in the code repo. Branching and Releases changes the range again for story branches, so a range method that also works with story branches avoids doing it twice.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Worktrees, protecting `develop` and the release process: [[Branching and Releases]].
- The `notes/` references in `.opencode/`, which goes away with [[Finish OpenCode Migration]].

# Implementation
