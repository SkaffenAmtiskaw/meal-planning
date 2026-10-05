---
type: infra
status: idea
blocked-by: []
confirmed: 2026-10-05
---
# Where It Stands

Decisions made. Next: /infra-design ^status

Shaped 2026-10-04 as one infra story. /decide settled every open decision: on 2026-10-04 that the Obsidian Git plugin and routines push notes straight to the notes repo's `main` and that the workflow instructions stay in the code repo, and on 2026-10-05 that Note Conventions, the templates and the Roadmap's rules move into the code repo too, so the vault holds only notes. /infra-design writes the Design, Conventions and Setup Outside the Repo next.

# Inbox
- For /infra-design, findings from /decide on [[Branching and Releases]] (2026-10-04):
  - **What the move changes:** about 115 `notes/` references across 30 files, outside `notes/`. Most are path swaps. These need new logic:
    - the git commands in `scripts/vault-lint.sh`, `scripts/vault-orphans.sh` and `.claude/agents/note-drift-checker.md`, and `/check-drift`'s `git blame`
    - `.claude/hooks/notes-only-edits.sh`'s `$CLAUDE_PROJECT_DIR/notes/` check, which 11 planning skills register
    - `.claude/rules/note-conventions.md` becomes the real file, in place of the symlink (decision 3). Its wikilinks, such as `[[Roadmap]]` and `[[Meal Editing]]`, stop resolving outside the vault, and `scripts/note-section.sh` and `scripts/vault-lint.sh` name its `notes/` path.
    - commits that now go to two repos (`/tooling`, AGENTS.md "Git and files")
    - `.gitignore`'s `/notes/.obsidian/` line
  - **Setup outside the repo:** a new GitHub repo, the Claude GitHub App's access to it, the routines' repo selection, and the Obsidian vault pointed at the new folder.
  - **Keeping the notes' git history:** a fresh repo makes every line look added on the day of the move. `/check-drift` would treat every [Sarah] comment as new since `confirmed`, and `note-drift-checker`'s `git log --since=<confirmed>` would list every note.
  - **Notes that quote `notes/` paths** get name-only corrections: three tech-debt notes at their "Note:" lines, the Hub template path in [[Agent Workflow Changes 2026-10-02]], and [[Docs Updates]].
- For /infra-design, findings from /decide on decision 2 (2026-10-04):
  - **Plugin settings:** turn on "Pull on startup" (`autoPullOnBoot`) and an auto-pull interval (`autoPullInterval`), both off by default, so routine changes reach the local folder. Pick `merge` or `rebase` as `syncMethod`. "Auto commit-and-sync after stopping file edits" shrinks the chance of committing an agent's change halfway through. The default commit message is `vault backup: {{date}}`, and nothing reads note commit messages.
  - **Conflicts:** a pull that conflicts leaves conflict markers in the note and stops automatic commits until someone resolves it. It needs a convention for resolving a stuck merge.
  - **Obsidian closed:** the plugin runs only while Obsidian is open, so edits made with it closed stay unpushed until it reopens. Routines and cloud sessions clone the pushed copy, so anything that needs the notes pushed first needs a manual Commit-and-sync.
  - **Wording:** AGENTS.md "Git and files" and `/tooling` assume sessions commit the notes. They now apply to the code repo only.
  - **Routine pushes:** `.claude/skills/routine-sessions/SKILL.md:24` changes to: `claude/` branches in the code repo, `main` in the notes repo. Its clause that other pushes are "checked first and can be rejected" contradicts the cloud environments docs ("It doesn't limit which branches a push can update"). `docs/ci.md:96` changes with it. The `dependency-updates` skill pushes to the notes repo's `main` with a pull-with-rebase-and-retry step, and a run with only majors opens no code PR.
  - **Notes repo setup:** its own `.gitignore` for `.obsidian/` (whether to track the plugin's `data.json` is open). No PR rule on its `main`, which would block the plugin. Check the routine's Edit form for a per-repo "Allow unrestricted branch pushes" toggle, which some guides mention and the official docs don't.

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
   - **Decided 2026-10-04:** the workflow instructions (skills, agents, the hook, scripts and the AGENTS.md note rules) stay in the code repo, and every reference to the notes folder goes through one place that finds it. The vault keeps only notes: Note Conventions, the templates and the Roadmap's rules move to the code repo, as decisions 3 and 4 settled. They describe this project's workflow, whose state happens to live in a second repo, so they change with the code and go through its PRs, and the notes repo stays a vault and nothing else, which decision 2 rests on.
     - Rejected: move the note-only pieces into the notes repo's `.claude/` - nothing loads locally through the `additionalDirectories` setting (only `--add-dir` or `/add-dir`, which the desktop app doesn't offer for local sessions), Obsidian Git would push unreviewed skill edits straight to `main`, and mixed skills would still stay in the code repo.
     - Rejected: a Claude Code plugin - cloud sessions don't install plugins, so routines would lose the note rules, and it adds a third place to version.
     - Rejected: user-level `~/.claude` or claude.ai skills - they leave version control, `~/.claude` doesn't reach routines, and claude.ai skills can't carry hooks, agents or scripts.
2. How do changes to the notes get committed and pushed, and what are the notes repo's push rules?
   - [Sarah] - If the repo is now an Obsidian vault and nothing else, then I'd like to use the Obsidian git plugin which automatically updates. But I want to have a second opinion if there might be any undesirable side effects to using it.
   - Branching and Releases' decision 3 (all work reaches `develop` through a PR) covers only the code repo. The answer also shapes the notes' git history, which `/check-drift` and `note-drift-checker` read.
   - **Decided 2026-10-04:** the Obsidian Git community plugin commits and pushes the notes repo straight to `main`, and routines push their note changes straight to `main` too, so the notes repo has no branches or PRs. Sarah's call, checked against the plugin's docs, the Claude Code routines docs and the notes: every side effect found is handled by a plugin setting or a convention, and she accepted that a routine's note changes land without her reviewing them first.
     - Rejected: routines push note changes to a `claude/` branch with a PR Sarah merges - every routine note change would wait on her to merge it.
3. Where does Note Conventions live, and how do sessions load it once the vault is its own repo?
   - Today the `.claude/rules/note-conventions.md` symlink loads it whenever a skill or agent file is read. Across repos, a relative link breaks when a worktree sits at a different depth and in a routine's clone layout, and an absolute link works only on Sarah's machine. Found by /decide on decision 1 (2026-10-04).
   - It maps skills and agents and changes with them, but it also links `[[Roadmap]]` and Sarah may read it in Obsidian.
   - **Decided 2026-10-05:** Note Conventions moves into the code repo as a real file at `.claude/rules/note-conventions.md`, in place of the symlink, and loads from there through its `paths` frontmatter like any rule file. Sarah's call.
     - Rejected: keep it in the vault and load it another way - the symlink that loads it today breaks across repos.
4. How does a workflow change that touches both the skills and the vault's own files (templates, Note Conventions, the Roadmap's rules) stay in step?
   - `/tooling` (`.claude/skills/tooling/SKILL.md:59`) treats these as one change today. After the move, the vault half goes live as soon as Obsidian Git pushes it, while `develop` and every open worktree run the old skills until the `/tooling` PR merges and `develop` is merged in. Found by /decide on decision 1 (2026-10-04).
   - **Decided 2026-10-05:** the templates and the Roadmap's rules ("How this file works") move into the code repo, like Note Conventions, and version with the skills. When a workflow change also edits existing Roadmap lines or sections, such as renaming a section, those edits are applied after its `/tooling` PR merges; story progress still updates the Roadmap right away. Sarah's call after research: every past change to them also changed the skills or `vault-lint.sh` (Common Closure Principle), and she doesn't insert templates in Obsidian, so the vault loses nothing she uses.
     - Rejected: keep the vault files and apply their half after the PR merges - every crossing change needs a second pass, and Sarah would review the vault half as a description, not in place.
     - Rejected: backward-compatible vault edits (expand, then contract) - renames can't be made compatible cleanly, the clean-up pass has to be remembered, and the vault half is live before approval.
     - Rejected: one combined change, accepting the gap - the vault half is live before approval, and an old worktree's `vault-lint.sh` can flag a restructured Roadmap that a session then reverts.

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
- How does `scripts/vault-lint.sh` find the notes a session changed, now that the plugin commits them every few minutes? Today its per-note checks cover only uncommitted notes (`git status`), and AGENTS.md "Before you finish" relies on that. Options from /decide (2026-10-04): the session passes the note names (the script already takes them), or the script diffs from a starting point.
- How do scripts and skill steps find the notes repo in a routine with both repos? Its working folder is the parent of the two clones, and it doesn't read the code repo's `.claude/settings.json`, so a fixed path or `$CLAUDE_PROJECT_DIR` won't find the notes there. Source: code.claude.com/docs/en/cloud-environments, "What carries over".
- Where do the templates and the Roadmap's rules go in the code repo, and how do the skills that use them find them? Decision 4 (2026-10-05) moves them there. Findings from /decide:
  - **What moves:** `notes/templates/` (12 files) and "How this file works" in `notes/Roadmap.md` (lines 5-29). The rules could go into `.claude/rules/note-conventions.md` or a file of their own, and the Roadmap could keep a pointer line to them.
  - **What reads them:** 9 skills and agents read templates by path (`shape`, `decide`, `roadmap`, `tooling`, `retyping-a-note`, `close`, `check-drift`, `split-checker`, `scope-router`), and 5 skills point to "How this file works" (`implement`, `roadmap`, `tooling`, `roadmap-placement`, `kickoff`). Also AGENTS.md:66, Note Conventions' "Templates are in `templates/`", the `notes/templates/` exclusions in `vault-lint.sh`, `vault-orphans.sh` and `note-refs.sh`, and `notes/.obsidian/templates.json`, which can go.
- How does `/tooling` hold a workflow change's edits to existing Roadmap lines or sections until its PR merges (decision 4)? `vault-lint.sh` hard-codes the Roadmap's section names and markers (lines 97-103 and 166-185), so it changes in the same PR as the skills.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Worktrees, protecting `develop` and the release process: [[Branching and Releases]].

# Implementation
