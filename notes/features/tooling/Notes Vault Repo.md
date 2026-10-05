---
type: infra
status: ready
blocked-by: []
confirmed: 2026-10-05
---
# Where It Stands

Ready. Next: /implement Step 1. Step 8 waits on [[Major Upgrade Sweeps]] ^status

Shaped 2026-10-04, and /decide settled its first four decisions on 2026-10-04 and 2026-10-05. /infra-design wrote the Goals, Design, Conventions and Setup Outside the Repo on 2026-10-05, settling a fifth decision on how sessions find the notes repo. /plan-steps planned 11 implementation steps on 2026-10-05, and nothing is built yet. Steps 1-7 can be built now: a test cloud session for the routine clone layout, then the changes that work while the notes are still in `notes/`. The cutover (Step 8) and the routine step (Step 9) wait on Major Upgrade Sweeps.

# Inbox

# Purpose
Move the notes vault out of the code repo into its own git repo, so notes are never branched. Split from [[Branching and Releases]], which waits on it. That story decided 2026-10-04 that the vault moves to its own git repo in a folder beside the code repo (outside its checkouts), that Obsidian points at it, that every session reaches it through Claude Code's `additionalDirectories` setting, and that notes are never branched.

# Goals
- [ ] Checking out another branch in the code repo, or working in a worktree, leaves the notes as they are: there's one copy of every note, outside the code repo's checkouts.
- [ ] Obsidian opens the vault from `~/repos/meal-planning-notes`, with the Obsidian Git plugin installed alongside its current settings and plugins.
- [ ] An edit Sarah makes in Obsidian reaches `main` of the `meal-planning-notes` GitHub repo without her committing it, and changes the routines push to `main` show up in her local vault without her pulling them.
- [ ] Every local Claude Code session, worktree sessions included, reads and edits notes in `~/repos/meal-planning-notes` without a permission prompt for that folder.
- [ ] `git blame` and `git log` on a note in the notes repo show its history from before the move, so `/check-drift` and `note-drift-checker` still see when each line changed.
- [ ] The notes repo holds only notes and their files. Note Conventions, the templates and the Roadmap's rules live in the code repo.
- [ ] The code repo has no `notes/` folder.
- [ ] `vault-lint.sh`, `vault-orphans.sh`, `note-refs.sh` and `note-section.sh` work on the notes repo when run from the main checkout, from a worktree or in a routine.
- [ ] A planning skill such as `/shape` can edit notes in the notes repo, and its hook still blocks it from editing code.
- [ ] `/final-review` still proposes a story's code range, worked out from when the notes repo first marked one of its steps ✅, until [[Branching and Releases]] replaces it with the story branch's range.
- [ ] Any note a routine's session adds or changes reaches the notes repo's `main`, never a code branch. The `dependency-updates` routine's sweep items are the first case.
- [ ] A `dependency-updates` run whose only changes are notes, such as one with only majors, opens no PR.

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
5. How do the skills, agents, AGENTS.md, the hook and the vault scripts name and reach note paths once the vault is in its own folder? Found by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** no symlink. One script, `scripts/notes-dir.sh`, prints the notes repo's absolute path, worked out from git: the `meal-planning-notes` folder beside the main checkout, found through `git rev-parse --git-common-dir`, so it works from any worktree. It stops with an error if the folder isn't there. The scripts, the hook and the skills get the path from it, and instructions name note paths from the notes repo's root. Sarah's call after research: one mechanism everywhere that fails loudly, with nothing to copy into worktrees or set in the cloud environment.
     - Rejected: a gitignored `notes` symlink in each checkout - `find` and `grep -r` on macOS and root-wide Grep and Glob skip it with no error, checking out a pre-move commit swaps in a stale copy of the notes, and it needs a creation step in every session, worktree and routine.
     - Rejected: a gitignored file holding the path - it has to be copied into each worktree through `.worktreeinclude`, and routines need the path from a cloud environment variable instead.

# Design
## Pieces
1. **The notes repo** - `~/repos/meal-planning-notes`, and a private GitHub repo `meal-planning-notes`. Holds the vault (the notes and their files) with its full history.
   - Made with `git subtree split --prefix=notes` in the code repo. It ships with git and rewrites only the commits that touched `notes/`, keeping each commit's author and date, so `git blame` and `git log` still show when each line changed. The new repo's `main` starts from that history.
   - Its `.gitignore` ignores all of `.obsidian/`, as the code repo does today, which keeps Obsidian's workspace churn and the plugin's settings out of the auto-commits.
   - `main` has no ruleset, since a PR rule would block the plugin's pushes (decision 2).
2. **The Obsidian Git plugin** - installed in the vault's `.obsidian/plugins/`, untracked. Commits and pushes note edits (Sarah's and local sessions') to the notes repo's `main`, and pulls in what routines push. Settings (defaults from the plugin's `DEFAULT_SETTINGS` in `src/constants.ts`):
   - Auto commit-and-sync interval 5 minutes (`autoSaveInterval`, default 0, off), with "Auto commit-and-sync after stopping file edits" on (`autoBackupAfterFileChange`), so the timer starts once edits stop and is less likely to commit an agent's change halfway through.
   - Auto pull interval 5 minutes (`autoPullInterval`, default off) and Pull on startup on (`autoPullOnBoot`, default off), so routine pushes reach the vault.
   - Sync method `merge`, the default: conflict recovery is simpler than with `rebase`, which can leave the repo stuck mid-rebase. The cost is an occasional merge commit, which nothing that reads the notes' history minds.
   - Commit message left at the default `vault backup: {{date}}`. Nothing reads note commit messages.
3. **`.claude/settings.json`** (new, tracked) - gives every local session access to the notes folder with no prompt: `"permissions": { "additionalDirectories": ["~/repos/meal-planning-notes"] }`, and nothing else.
   - `~` paths are expanded, while a relative path resolves from the worktree root in a worktree, so `../meal-planning-notes` would break wherever worktrees don't sit beside the repo (code.claude.com/docs/en/settings-reference, `permissions.additionalDirectories`). Each worktree reads its own copy of this tracked file.
   - Routines don't read it: a session with two repos starts above both clones and attaches each as an additional directory itself (code.claude.com/docs/en/cloud-environments, "What carries over"). So it only has to agree with `notes-dir.sh` on Sarah's Mac.
4. **`scripts/notes-dir.sh`** (new) - prints the notes repo's absolute path, the one place everything finds it (decision 5).
   - From its own folder, it runs `git rev-parse --path-format=absolute --git-common-dir`, which gives the main checkout's `.git` from the main checkout and from any worktree, and takes the `meal-planning-notes` folder beside that checkout. In a routine, that's the notes clone beside the code clone.
   - If the folder isn't there, it prints an error naming the path it looked for and exits non-zero, so a caller stops instead of working on nothing.
   - The vault scripts, the hook, and git commands on notes in skills and agents call it, and AGENTS.md says it exists. An agent without Bash gets the path from its caller.
5. **The four vault scripts** - still check and search the vault; what changes is where they look.
   - `vault-lint.sh` gets the notes path from `notes-dir.sh` and works there. Its per-note checks cover only the notes named as arguments: the session names each note it changed, and the `git status` fallback goes, since the plugin commits edits within minutes. Sarah decided this 2026-10-05 over diffing from a starting point, which needs a SessionStart hook routines don't run and picks up other sessions' notes. With no arguments it runs only the whole-vault checks and says so. Its exclusions for `templates/` and Note Conventions go. Its Roadmap section names and markers stay as they are. It gains a whole-vault check that reports any line starting with `<<<<<<<` (a plugin merge conflict).
   - `vault-orphans.sh` looks in the notes repo and reads each orphan's git state there.
   - `note-refs.sh` searches the notes repo for "In the vault" and the code repo (`src`, `test`, `docs`, `.claude`, AGENTS.md, CLAUDE.md) for "Outside the vault". Its `templates/` exclusions go.
   - `note-section.sh` reads `.claude/rules/note-conventions.md` in the code repo and doesn't need the notes path.
6. **`.claude/hooks/notes-only-edits.sh`** - still lets a planning skill edit only notes, `.scratch/`, Claude's memory and the code-repo folders the skill names (such as `docs`). The `$CLAUDE_PROJECT_DIR/notes/` case becomes the path `notes-dir.sh` prints, followed by `/`. `.scratch/` and named folders stay relative to `$CLAUDE_PROJECT_DIR`. If `notes-dir.sh` fails, the hook blocks the edit and passes on its error. The block message says "the notes repo". The 11 skills that register it keep their frontmatter.
7. **Note Conventions, at `.claude/rules/note-conventions.md`** - the workflow map, loaded through its `paths` frontmatter whenever a session reads a skill or agent file. The symlink is removed in a commit of its own, then the note is moved with `git mv` in the next, so `git log --follow` follows its history; in one commit, git counts the path as changed rather than added and `--follow` stops at the move.
   - Its wikilinks become plain names ("The Roadmap", `Meal Editing`). The `[[link]]` format examples in the frontmatter table stay.
   - "Templates are in `templates/`" becomes `.claude/note-templates/`.
   - The comment line about the symlink goes, along with wording that places it in the vault.
   - Files says its folder paths (`features/<area>/`, `goals/`, `archive/`, `assets/`) are in the notes repo.
8. **The templates, at `.claude/note-templates/`** - the 12 note templates, moved with `git mv` from `notes/templates/`. Under `.claude/` with the rest of the workflow, but not in `.claude/rules/`, which would load all 12. The skills and agents that read a template keep reading the one they need by path. The vault's `.obsidian/templates.json` setting goes, since Sarah doesn't insert templates in Obsidian.
9. **The `roadmap-rules` shared-rule skill, at `.claude/skills/roadmap-rules/SKILL.md`** - holds the Roadmap's rules, "How this file works" (lines 5-29 of `Roadmap.md` today), moved word for word apart from link-to-name swaps. `user-invocable: false`, with a description saying to use it before adding, moving or editing a Roadmap line. `/implement`, `/roadmap`, `/tooling`, `roadmap-placement` and `/kickoff` point to it by name in place of "How this file works", and `vault-lint.sh`'s comment points to it. Sarah decided this 2026-10-05 over a section in Note Conventions, following `/tooling`'s rule that an agent rule several skills share but that doesn't belong in every session gets its own skill. The Roadmap keeps lines 1-3 and gets one plain-text line in place of the section: "How this file works: the `roadmap-rules` skill in the meal-planning repo."
10. **The instructions that name note paths** - every skill, agent, AGENTS.md line and doc that names `notes/` (about 115 strings in about 30 files) points at the notes repo instead, written once during the build.
    - Paths are written from the notes repo's root, saying which repo, such as "`features/` in the notes repo". AGENTS.md's opening says where the notes live and that `sh scripts/notes-dir.sh` prints the path.
    - Git commands on notes run as `git -C "<notes path>"`: `/check-drift`'s `git blame`, and `note-drift-checker`'s `git log`, `git status` and `git show`. The agents with no Bash (`scope-router`, `split-checker`, `decision-researcher`, `code-drift-checker`, `code-critic`) get the notes path in their caller's prompt.
    - AGENTS.md "Git and files": "Don't commit unless Sarah asks" covers the code repo. The notes repo is committed by the plugin locally and by routines as their skills say, so a local session never commits or pushes it. The delete check reads `git status` in the repo the file is in. "Before you finish": `sh scripts/vault-lint.sh "<note>" …`, naming each note the session changed.
    - `/kickoff` and `/close` keep plain `cp`, `mv` and `rm`, but their "so every change stays unstaged" reason goes. `/tooling`'s "Leave every change unstaged" covers the code repo.
    - `docs/project_structure.md` replaces its `notes/` and `Roadmap.md` entries with a Notes entry: the notes live in the `meal-planning-notes` repo beside this one, synced by Obsidian Git with Piece 2's settings. `.gitignore` drops `/notes/.obsidian/`.
    - The notes that quote `notes/` paths get name-only corrections: three tech-debt notes at their "Note:" lines, the Hub template path in [[Agent Workflow Changes 2026-10-02]], and [[Docs Updates]].
11. **`/final-review`'s range** (`.claude/skills/final-review/SKILL.md`, step 2) - still proposes the story's code range for Sarah to confirm. It runs the same `git log --follow -S'**Status:** ✅ Complete'` in the notes repo to find the first commit that marked a step done and takes its date. The proposed start is the parent of the last code-repo commit before that date (`git log -1 --before=<date>`). The check of the few commits before it for step 1's files stays. The plugin commits the ✅ within minutes, so the date tracks when the step was marked done. Step 2 says this is interim until [[Branching and Releases]] replaces it with the story branch's range. Point 3's "leaving out `notes/`" goes.
12. **`/tooling`** (`.claude/skills/tooling/SKILL.md`) - step 2 searches `.claude/` (now including Note Conventions, the templates and `roadmap-rules`), AGENTS.md, `docs/` and `scripts/`, and step 4's "all of `notes/`" becomes the notes repo. Holding Roadmap edits (decision 4): an edit to existing Roadmap lines or sections that the change causes, such as renaming a section, isn't made with the rest of step 4. `/tooling` lists each one in its step 5 report under "Roadmap edits to apply after the commit", and when Sarah asks that session to commit, it commits the code repo change first, then makes those edits and runs `vault-lint.sh`. Until [[Branching and Releases]] gives `/tooling` a branch and a PR, the commit to `develop` is when the skills go live; that story moves this to "after its PR merges". Story progress still updates the Roadmap right away. `vault-lint.sh` changes in the same commit as the skills.
13. **The `routine-sessions` skill and `docs/ci.md`** - the shared rules for a routine's session, and the record of the GitHub setup.
    - Branches: a session pushes only to `claude/` branches in the code repo, and only to `main` in the notes repo. Before pushing notes it runs `git pull --rebase`, and if the push is rejected because the plugin pushed meanwhile, it pulls and retries. If the rebase conflicts, it stops and reports without pushing.
    - Boy Scout fix: "a push to any other branch is checked first and can be rejected" goes. The routines docs say nothing on Claude's side limits which branch a push updates; only GitHub's rules do. Found by /decide on decision 2, 2026-10-04.
    - What the Session Does: a routine that edits notes has both repos selected, its session starts above the two clones, and its skill `cd`s into the code clone before running scripts, which find the notes clone beside it through `notes-dir.sh`.
    - `docs/ci.md`, "The Claude GitHub App": the app has access to both repos; routines push `claude/` branches in `meal-planning` and `main` in `meal-planning-notes`.
14. **The `dependency-updates` skill and its `routine.md`** - as [[Major Upgrade Sweeps]] leaves the skill, it writes sweep items in the notes clone instead of on `claude/dependency-updates`, runs `vault-lint.sh` naming the sweep notes it changed, commits in the notes repo and pushes to `main` as `routine-sessions` says. A run whose only changes are notes cuts no branch and opens no PR. The summary says which sweep items reached the notes repo, with the commit. `routine.md`'s Repositories becomes `meal-planning` and `meal-planning-notes`. `docs/ci.md`'s `dependency-updates` entry changes too if it says where sweep items go.

## Flow
**A note edited on Sarah's Mac:**
1. Sarah edits a note in Obsidian, or a local session (main checkout or worktree) does. A session gets the path from `notes-dir.sh` and edits with no prompt through `additionalDirectories`. A planning skill's hook lets the edit through because it's in the notes repo.
2. Before it finishes, the session runs `sh scripts/vault-lint.sh` naming each note it changed, and fixes what's reported in those notes.
3. Five minutes after edits stop, Obsidian Git commits everything changed in the vault and pushes it to `main`, pulling first.
4. A checkout of another branch, or a worktree, in the code repo touches none of it.

**A note edited by a routine:**
1. The trigger fires. The session clones `meal-planning` and `meal-planning-notes` on their default branches and starts above them.
2. It `cd`s into the code clone and does its code work there, on a `claude/` branch if it changes code.
3. It edits notes in the notes clone (found through `notes-dir.sh`), runs `vault-lint.sh` naming them, and commits in the notes repo.
4. It runs `git pull --rebase` and pushes to the notes repo's `main`, retrying if the plugin pushed in between. A PR is opened only if it changed code.
5. Within five minutes, the plugin's auto pull brings the change into Sarah's vault, or at Obsidian's next startup if it's closed.

**When something fails:**
- **`notes-dir.sh` can't find the notes folder:** it names the path it looked for and exits non-zero. A script stops, the hook blocks the edit, and the session tells Sarah.
- **Obsidian is closed:** edits stay uncommitted in the folder, and the plugin commits them when Obsidian next opens. If something needs them on GitHub first, such as a routine or a cloud session that reads them, Sarah runs Obsidian Git's Commit-and-sync command by hand.
- **The plugin's pull conflicts:** the note gets conflict markers, and the plugin stops auto-committing until they're resolved. Sarah resolves them in Obsidian and runs Commit-and-sync. `vault-lint.sh` reports any line starting with `<<<<<<<`, so a session sees the conflict and tells her instead of editing around it.
- **A routine's rebase conflicts:** it doesn't push its notes. It stops, says which notes conflicted, and waits for Sarah in the session.

**The one-time move:**
1. **Before building:** one test cloud session with both repos confirms that the clones sit side by side, and what `$CLAUDE_PROJECT_DIR` is there. If they aren't siblings, building stops and the finding goes to Sarah, since `notes-dir.sh`'s routine case depends on it.
2. **Freeze:** Obsidian is closed and every pending note change is committed in the code repo.
3. **Out of the vault first:** Note Conventions, the templates and the Roadmap's rules move into the code repo in their own commit, so the vault's history ends with them gone.
4. **Split:** `git subtree split --prefix=notes` makes the history. `~/repos/meal-planning-notes` is cloned from it as `main`, given its `.gitignore`, and pushed to the new GitHub repo. The untracked `notes/.obsidian/` is copied in, so Obsidian keeps its settings.
5. **Cut over in one commit:** the code repo drops `notes/` and takes the settings file, `notes-dir.sh`, the scripts, the hook and the rewritten instructions together, so no commit has skills pointing at a folder that isn't there yet.
6. **Reconnect:** Obsidian opens the new folder and gets the plugin, and the GitHub App and the `dependency-updates` routine get the notes repo (Setup Outside the Repo).

# Conventions
- **Note paths in instructions:** a skill, agent or doc that names a note path writes it from the notes repo's root and names the repo, such as "`features/` in the notes repo", never `notes/…`. A script or hook that needs the folder on disk gets it from `sh scripts/notes-dir.sh`, never from a path of its own. Lands in `/tooling`'s "Writing instructions" bullet; AGENTS.md's opening line says the script exists.
- **Agents with no Bash:** when a skill sends an agent that has no Bash (such as `scope-router` or `decision-researcher`) work that reads notes, it puts the notes repo's path in the agent's prompt. Lands in `/tooling`'s bullet on new skills and agents.
- **Committing notes:** a local session never commits or pushes the notes repo; Obsidian Git does. "Don't commit unless Sarah asks" is about the code repo. Lands in AGENTS.md, "Git and files".
- **Linting changed notes:** a session that changed notes runs `sh scripts/vault-lint.sh` naming each note it changed before it finishes, routines included. Lands in AGENTS.md, "Before you finish".
- **Routines that change notes:** the routine has both repos selected. It pushes its note changes straight to the notes repo's `main` (pull with rebase, retry if rejected, stop without pushing on a conflict), and opens a PR only for code changes. Lands in the `routine-sessions` skill, Branches.
- **Roadmap edits from a workflow change:** when a workflow change also edits existing Roadmap lines or sections, such as renaming a section, those edits are made only once the change is committed to `develop` (after its PR merges, once [[Branching and Releases]] adds one). Story progress updates the Roadmap right away. Lands in `/tooling`, step 4 and its step 5 report.

# Setup Outside the Repo
1. **The GitHub repo:** a private, empty repo `meal-planning-notes` on Sarah's account, with no README, since the history is pushed into it. Recorded in `docs/project_structure.md`.
2. **The Claude GitHub App's access:** on GitHub, Settings → Applications → Claude → Configure, add `meal-planning-notes` to its repositories. Recorded in `docs/ci.md`, "The Claude GitHub App".
3. **The `dependency-updates` routine:** at https://claude.ai/code/routines → the routine → Edit, add `meal-planning-notes` under repositories. Check whether the form has a per-repo "Allow unrestricted branch pushes" toggle, which some guides mention and the docs don't; if it does, turn it on for the notes repo. Recorded in `.claude/skills/dependency-updates/routine.md`.
4. **Obsidian:** open `~/repos/meal-planning-notes` as a vault ("Open folder as vault"), and remove the old `notes/` vault from the vault list. Recorded in AGENTS.md's opening line.
5. **The Obsidian Git plugin:** installed from Community plugins, with Piece 2's settings. Recorded in `docs/project_structure.md`'s Notes entry.

No secrets: the plugin pushes with the git credentials Sarah's Mac already uses for GitHub.

# Out of Scope
- Worktrees, protecting `develop` and the release process: [[Branching and Releases]].

# Implementation
Order and facts the steps rely on, settled while planning on 2026-10-05:
- **Order.** Step 1 is the design's "Before building" test. Steps 2-7 change the code repo while the notes are still in `notes/`, and each leaves everything working, so each is committed on its own. Step 8 is the cutover, in one commit (Flow, "The one-time move", steps 2, 4, 5 and 6). Steps 9-11 build on the notes repo once it exists. Step 9, the routine step, comes right after the cutover because it needs nothing from Steps 10 or 11, and it closes the gap where a scheduled `dependency-updates` run would flag majors instead of adding sweep items; Sarah decided this 2026-10-05. Steps 8 and 9 wait on [[Major Upgrade Sweeps]]: Step 8 moves the sweep notes that story's skill writes, and Step 9 changes that skill. Sarah decided 2026-10-05 that Steps 1-7 can be built before it's done.
- **The routine pieces.** Sarah decided 2026-10-05 that Pieces 13 and 14 get their own step after the cutover (Step 9) rather than joining its commit. A `dependency-updates` run fired between Steps 8 and 9 finds no sweep note, so it flags its majors, and `vault-lint.sh` stops it with `notes-dir.sh`'s error.
- **The `/tooling` conventions.** Sarah decided 2026-10-05 that the "Note paths in instructions" and "Agents with no Bash" bullets go in with the cutover (Step 8), so no `/tooling` change after it writes `notes/` paths again.
- **Moving a file over a symlink.** When a file is moved with `git mv` onto a path that was a tracked symlink, in one commit, git counts the path as changed rather than added, and `git log --follow` stops at the move. With the symlink removed in a commit of its own first, `--follow` follows the file back through its old path. Checked in a scratch repo 2026-10-05; Step 2 moves Note Conventions in two commits.

## Step 1: A cloud session clones the notes repo beside the code repo
**Idea:** A cloud session with both repos attached clones `meal-planning-notes` into a folder beside `meal-planning`.

**Source:** Flow, "The one-time move" step 1 (before building); Setup 1 (the GitHub repo); Setup 2 (the Claude GitHub App's access); Piece 4's routine case, which relies on the clones being siblings.

**Approach:**
- Walk Sarah through Setup 1: a private, empty `meal-planning-notes` repo on her account, with no README, `.gitignore` or license.
- Walk her through Setup 2: GitHub, Settings → Applications → Claude → Configure, add `meal-planning-notes`.
- Record Setup 2 in `docs/ci.md`, "The Claude GitHub App": the app has access to `meal-planning` and `meal-planning-notes`. What routines push in each repo is Step 9's.
- The test session: Sarah starts a cloud session at https://claude.ai/code on the `Meal Planning Routines` environment with both repos selected. If the session form takes only one repo, she makes a throwaway routine with both repos and the same environment, and runs it once with "Run now", then deletes it. Its prompt (the implementer writes it): print `pwd`, list the working folder and its parent, print `$CLAUDE_PROJECT_DIR`, and print `git rev-parse --show-toplevel` in each clone.
- If claude.ai won't attach or clone the empty repo, stop and bring it to Sarah.
- If the clones aren't siblings, stop: building stops and the finding goes to Sarah, since `notes-dir.sh`'s routine case depends on it (Flow, step 1).
- **Implementer:** compare the code clone's path with the environment's setup script, which finds the repo with `find / -maxdepth 4` (`docs/ci.md`, "The Cloud Environment"). If `mise.toml` sits deeper than four levels below `/`, stop and bring it to Sarah, as for the not-siblings case, since every routine with both repos would fail its setup.
- Record the two clone paths and `$CLAUDE_PROJECT_DIR` in this step's As built note. Steps 8 and 9 use them.

**Files:**
- `docs/ci.md` - "The Claude GitHub App" records the app's access to the notes repo (Setup 2)

**Acceptance:**
- [ ] In the test session's output, see the clones of `meal-planning` and `meal-planning-notes` as two folders under one parent, and what `$CLAUDE_PROJECT_DIR` is. Proves: a routine with both repos has the notes clone beside the code clone, where `notes-dir.sh` will look for it.

## Step 2: Note Conventions becomes a real file in the code repo
**Idea:** Note Conventions moves out of the vault to `.claude/rules/note-conventions.md`, in place of the symlink that loads it today.

**Source:** Piece 7, apart from its Files bullet (Step 8); Goal: "Note Conventions, the templates and the Roadmap's rules live in the code repo" (Note Conventions); Flow, "The one-time move" step 3; decision 3.

**Approach:**
- **Before changing anything:** ask Sarah to confirm that no other Claude Code session is running, and that she won't start one until this step is committed (its second commit, the move). This step moves a file that skills read, so while its changes are uncommitted, another session can look for Note Conventions at its old path.
- **Two commits, so its history follows it** (see the fact above): stage only the symlink's removal (`git rm .claude/rules/note-conventions.md`) and ask Sarah to commit it. Then `git mv "notes/Note Conventions.md" .claude/rules/note-conventions.md` for the rest of the step. Its `paths` frontmatter stays.
- Piece 7's edits: its wikilinks become plain names ("the Roadmap", `Meal Editing`), with the `[[link]]` format examples in the frontmatter table kept; the Obsidian comment about the symlink goes; "How notes in this vault are organized" no longer places the file in the vault. "Templates are in `templates/`" stays until Step 3.
- Every path to it: `scripts/note-section.sh` (its `file` and comment), AGENTS.md "Anything bigger, outside a skill", `/shape` (step 1), `retyping-a-note`, `scope-router`, and `/tooling` step 2's search list, which drops `notes/Note Conventions.md` since `.claude/` now covers it. The implementer greps for any other.
- `vault-lint.sh`: its two Note Conventions exclusions go (the `git status` filter and the broken-link filter).
- **Implementer:** before changing anything, record the output of `sh scripts/vault-lint.sh` with no arguments. After, run it again and see the same result, and run `sh scripts/note-section.sh "Lifecycle"` and see the section print.

**Files:**
- `notes/Note Conventions.md` → `.claude/rules/note-conventions.md` (moved, replacing the symlink) - the file itself, with Piece 7's edits
- `scripts/note-section.sh` - reads the new path
- `scripts/vault-lint.sh` - drops the exclusions for a file no longer in the vault
- `AGENTS.md` - names the new path
- `.claude/skills/shape/SKILL.md`, `.claude/skills/retyping-a-note/SKILL.md`, `.claude/agents/scope-router.md` - name the new path
- `.claude/skills/tooling/SKILL.md` - step 2's search list drops the old path

**Acceptance:**
- [ ] In a new Code-tab session, ask it to read `.claude/skills/close/SKILL.md`, then, without reading any other file, say what the `confirmed` property records and when it isn't bumped. See it answer from Note Conventions, including "not for moves, renames or link fixes", which only Note Conventions says. Proves: the rule still loads when a session reads a skill, now that it's a real file.
- [ ] Once the move is committed (the second commit), run `git log --follow --oneline -- .claude/rules/note-conventions.md`, see commits from before the move that changed `notes/Note Conventions.md`. Proves: its history moved with it.

## Step 3: The note templates move into the code repo
**Idea:** The 12 note templates move from `notes/templates/` to `.claude/note-templates/`.

**Source:** Piece 8; Goal: "Note Conventions, the templates and the Roadmap's rules live in the code repo" (templates); Flow, "The one-time move" step 3; decision 4.

**Approach:**
- **Before changing anything:** ask Sarah to confirm that no other Claude Code session is running, and that she won't start one until this step is committed. This step moves a file that skills read, so while its changes are uncommitted, another session can look for a template at its old path.
- `git mv notes/templates .claude/note-templates`.
- Every path to them: the skills and agents that read a template (`/shape`, `/decide`, `/roadmap`, `/tooling`, `retyping-a-note`, `/check-drift`, `split-checker`, `scope-router`, and any other the implementer's grep finds), AGENTS.md "Template comments", and Note Conventions' "Templates are in `templates/`". `/tooling` step 2's search list drops `notes/templates/`. `/close` steps 2 and 8 drop their mentions of the `templates/` exclusion.
- The scripts' `templates/` exclusions go: `vault-lint.sh`, `vault-orphans.sh` (and its comment) and `note-refs.sh`.
- The vault's `notes/.obsidian/templates.json` goes. It's untracked, so ask Sarah before deleting it, as AGENTS.md describes under "Git and files".
- Name-only correction in the vault: the Hub template path in [[Agent Workflow Changes 2026-10-02]]'s "Notes copy a story's status" item.
- **Implementer:** before changing anything, record the output of `vault-lint.sh` (no arguments), `vault-orphans.sh` and `note-refs.sh "Meal Editing"`. After, see the same output from each. Check that every template path the instructions now name exists.

**Files:**
- `notes/templates/*.md` → `.claude/note-templates/*.md` (moved) - the templates' new home
- `.claude/skills/shape/SKILL.md`, `.claude/skills/decide/SKILL.md`, `.claude/skills/roadmap/SKILL.md`, `.claude/skills/tooling/SKILL.md`, `.claude/skills/retyping-a-note/SKILL.md`, `.claude/skills/check-drift/SKILL.md`, `.claude/skills/close/SKILL.md`, `.claude/agents/split-checker.md`, `.claude/agents/scope-router.md` - name the new path
- `AGENTS.md` - "Template comments" names the new path
- `.claude/rules/note-conventions.md` - Templates names the new path
- `scripts/vault-lint.sh`, `scripts/vault-orphans.sh`, `scripts/note-refs.sh` - drop the exclusions for a folder no longer in the vault
- `notes/features/tooling/Agent Workflow Changes 2026-10-02.md` - name-only correction of the Hub template path

**Acceptance:**
- [ ] In a new Code-tab session, ask it to send the `scope-router` subagent one item: "Let users export a week's meal plan as a PDF: pick the week, choose whether to include recipes and shopping lists, and decide whether it's generated in the browser or on the server, which is still open. Found while planning Notes Vault Repo; it's new app behavior, outside a tooling story." See its suggestion of a new idea note drafted from a template, and in the agent's tool calls a read of a file in `.claude/note-templates/`. Proves: agents and skills find the templates at their new path.

## Step 4: The Roadmap's rules become the `roadmap-rules` skill
**Idea:** The Roadmap's "How this file works" section moves into a shared-rule skill, `roadmap-rules`.

**Source:** Piece 9; Goal: "Note Conventions, the templates and the Roadmap's rules live in the code repo" (Roadmap's rules); Flow, "The one-time move" step 3; decision 4.

**Approach:**
- **Before changing anything:** ask Sarah to confirm that no other Claude Code session is running, and that she won't start one until this step is committed. This step moves a file that skills read, so while its changes are uncommitted, another session can look for the Roadmap's rules at its old path.
- `.claude/skills/roadmap-rules/SKILL.md` (new): `user-invocable: false`, with a description saying to use it before adding, moving or editing a Roadmap line. Its body is "How this file works" (`notes/Roadmap.md` lines 5-29) word for word, apart from link-to-name swaps (`[[Dev Tooling]]` → Dev Tooling and so on). The `[[Goal]]` in the marker formats stays, as a format example.
- `notes/Roadmap.md` keeps lines 1-3, and the section is replaced by one plain-text line: "How this file works: the `roadmap-rules` skill in the meal-planning repo."
- `/implement`, `/roadmap`, `/tooling`, `roadmap-placement` and `/kickoff` point to the skill by name wherever they say "the Roadmap's 'How this file works'". `/roadmap` step 1's "Read `notes/Roadmap.md`, including 'How this file works'" reads the Roadmap and the skill. `vault-lint.sh`'s header comment points to it.
- **Work the story needs:** the agents that read the Roadmap for its rules today (`scope-router`, which suggests Roadmap lines, and `split-checker`, which writes children's lines) would lose them with the section. Each preloads the skill with `skills:` in its frontmatter, as `/tooling` describes for shared-rule skills. The implementer greps for any other agent that reads the Roadmap.
- Name-only corrections in the vault: [[Notes Vault Changes]]'s "Rename the Roadmap's 'Ideas' section" item says "the 'How this file works' bullet", which becomes "the `roadmap-rules` skill's bullet"; [[Agent Workflow Changes]]' "A light path for small note-less work" item says "the Roadmap's 'How this file works'", which becomes "the `roadmap-rules` skill".
- [[Agent Workflow Changes 2026-10-02]]'s `roadmap-placement` item quotes the line this step rewrites. It's another story's remaining work, so it stays as it is, and the report tells Sarah.
- **Implementer:** run `vault-lint.sh` with no arguments and see no new reports.

**Files:**
- `.claude/skills/roadmap-rules/SKILL.md` (new) - the Roadmap's rules
- `notes/Roadmap.md` - the section becomes a pointer line
- `.claude/skills/implement/SKILL.md`, `.claude/skills/roadmap/SKILL.md`, `.claude/skills/tooling/SKILL.md`, `.claude/skills/roadmap-placement/SKILL.md`, `.claude/skills/kickoff/SKILL.md` - point to the skill
- `.claude/agents/scope-router.md`, `.claude/agents/split-checker.md` - preload the skill
- `scripts/vault-lint.sh` - its comment points to the skill
- `notes/features/tooling/Notes Vault Changes.md`, `notes/features/tooling/Agent Workflow Changes.md` - name-only corrections

**Acceptance:**
- [ ] In a new Code-tab session, ask: "A new sweep note was just created. Where does its Roadmap line go?" See it load the `roadmap-rules` skill and answer: in Unaffiliated in Later, with no 🎯 links. Proves: sessions load the rules when they need them, now that they're out of the Roadmap.

## Step 5: `vault-lint.sh` checks only the notes it's given
**Idea:** `vault-lint.sh` runs its per-note checks on the notes named as arguments, instead of on what `git status` shows changed.

**Source:** Piece 5, `vault-lint.sh`: named notes only, the `git status` fallback goes, with no arguments it runs only the whole-vault checks and says so (Sarah's 2026-10-05 decision); Convention: "Linting changed notes"; Flow, "A note edited on Sarah's Mac" step 2.

**Approach:**
- `vault-lint.sh`: the `git status` branch goes. With no arguments, it runs the whole-vault checks and its last line says no notes were named, so only those ran.
- **Work the story needs:** the Roadmap, if named, gets no per-note checks. Today only the `git status` fallback skips it, and sessions will now name it, but it has no `^status` line or Where It Stands, and the whole-vault checks cover it. The header comment says how it works now.
- AGENTS.md "Before you finish": run `sh scripts/vault-lint.sh "<note>" …`, naming each note the session changed. Its description of what the script checks changes to match.
- **Implementer:** run it naming `Roadmap` and see no per-note report for it.

**Files:**
- `scripts/vault-lint.sh` - per-note checks from arguments only
- `AGENTS.md` - "Before you finish" names the changed notes

**Acceptance:**
- [ ] Delete the `# Where It Stands` heading from a note in `notes/features/` and leave it uncommitted. Run `sh scripts/vault-lint.sh`, see the line saying only the whole-vault checks ran, and nothing about that note. Run `sh scripts/vault-lint.sh "<that note>"`, see "no # Where It Stands section" reported for it. Undo the edit. Proves: per-note checks follow the notes a session names, not what's uncommitted.

## Step 6: `/final-review` finds a story's start by date
**Idea:** `/final-review` proposes a story's first commit from the date its first step was marked ✅, rather than from the commit that marked it.

**Source:** Piece 11: the proposed start from the ✅ commit's date, the check of the commits before it for step 1's files, the interim note; Goal: "`/final-review` still proposes a story's code range ...".

**Approach:**
- `/final-review` step 2, point 1: the same `git log --follow -S'**Status:** ✅ Complete'` on the note, with the ✅ commit's full committer timestamp (`%cI`, since `--before` filters on the committer date and a day alone would depend on the time of day it runs). The proposed start is the parent of the last code-repo commit at or before that time (`git log -1 --before=<timestamp>`). The check of the few commits before it for step 1's files stays. Step 2 says this is interim until [[Branching and Releases]] replaces it with the story branch's range.
- Until Step 8, the notes share the code repo's history, so the method finds the same commit the old one did. Step 8 points the `git log` at the notes repo and drops point 3's "leaving out `notes/`".
- **Implementer:** before changing anything, pick a story with ✅ steps (such as [[Dependency Update PRs]], if it's still open) and record the start the old method gives for it.

**Files:**
- `.claude/skills/final-review/SKILL.md` - step 2 finds the start by date

**Acceptance:**
- [ ] In a new Code-tab session, ask it to carry out only `/final-review`'s step 2, point 1, for the story the implementer picked, and show the proposed start commit. See the same commit the implementer recorded. Proves: the date method gives the same start as the old one.

## Step 7: `/tooling` holds a workflow change's Roadmap edits until it's committed
**Idea:** `/tooling` makes a workflow change's edits to existing Roadmap lines or sections only after the change is committed.

**Source:** Piece 12, holding Roadmap edits; Convention: "Roadmap edits from a workflow change"; decision 4.

**Approach:**
- `/tooling` step 4: an edit to existing Roadmap lines or sections that the change causes, such as renaming a section, isn't made with the rest. Step 5's report lists each under "Roadmap edits to apply after the commit". When Sarah asks the session to commit, it commits the code-repo change first, then makes those edits and runs `vault-lint.sh` naming the notes it changed. Until [[Branching and Releases]] gives `/tooling` a branch and a PR, the commit to `develop` is when the skills go live. Story progress still updates the Roadmap right away.
- Written with the condition first, as `/tooling`'s "Writing instructions" asks.
- Piece 12's "`vault-lint.sh` changes in the same commit as the skills" needs no new text: the script is in the code repo, so a `/tooling` change that alters it commits it with the skills.


**Files:**
- `.claude/skills/tooling/SKILL.md` - steps 4 and 5 hold Roadmap edits until the commit

**Acceptance:**
- [ ] On a throwaway local branch (`git switch -c tooling-check`), start a new Code-tab session and run `/tooling` with "rename the Roadmap's Later section to Backlog", and approve its draft. See step 4 leave the Roadmap's `# Later` heading as it is, and the report list the rename under "Roadmap edits to apply after the commit". Ask it to commit, and see it commit the skill changes first, then rename the heading and run `vault-lint.sh` naming the Roadmap. Switch back to `develop`, delete the branch and undo the Roadmap edit. Proves: a workflow change's Roadmap edits wait for its commit, then follow it.

## Step 8: The vault moves into the notes repo
**Idea:** Every note moves from the code repo's `notes/` into the notes repo, with its history.

**Source:** Piece 1; Piece 3; Piece 4; Piece 5 (where `vault-lint.sh`, `vault-orphans.sh` and `note-refs.sh` look); Piece 6; Piece 7, its Files bullet; Piece 10; Piece 11 (the notes repo's `git log`, point 3's "leaving out `notes/`"); Piece 12 (step 4 searches the notes repo); Flow, "The one-time move" steps 2, 4, 5 and 6 (Obsidian); Flow, "A note edited on Sarah's Mac" steps 1 and 4; Flow failure: "`notes-dir.sh` can't find the notes folder"; Setup 4; Conventions: "Note paths in instructions", "Agents with no Bash"; Goals: one copy of every note outside the code repo's checkouts; Obsidian opens the vault from `~/repos/meal-planning-notes`; sessions and worktree sessions edit notes with no prompt; `git blame` and `git log` show history from before the move; the notes repo holds only notes; no `notes/` folder; the vault scripts work from the main checkout and a worktree; a planning skill can edit notes and is still blocked from code; `/final-review`'s range.

**Approach:**
- **Before changing anything:** ask Sarah to confirm each of these, one at a time:
  - No other Claude Code session is running, and she won't start one until the cutover is committed and Obsidian opens the new folder. A note edited in `notes/` after the split is lost, and a session started before the cutover has the old instructions loaded, so it would write to `notes/` and bring the folder back. Sessions started after that point are fine.
  - No worktree made before the cutover still has work in it. A worktree made before it has its own `notes/`, so note edits there go to a stale copy. She finishes or removes those first, and makes new ones afterwards.
  - She won't fire the `dependency-updates` routine by hand until Step 9 is pushed to `develop`. A run in between flags its majors instead of adding sweep items, and the dependency check doesn't report those versions again, so the items would have to be added by hand from its summary. The weekly scheduled run is covered at the end of this step.
- **Left to Step 9:** `dependency-updates`' `SKILL.md` and `routine.md`, as Sarah decided 2026-10-05. A run fired between the two steps finds no sweep note and flags its majors (Major Upgrade Sweeps' "the note is gone" case), and `vault-lint.sh` stops it with `notes-dir.sh`'s error.
- **Before the freeze:** any open PR whose branch changes `notes/`, such as a `claude/dependency-updates` PR carrying sweep items, is merged or closed, so nothing brings `notes/` back. Record the output of `vault-lint.sh`, `vault-orphans.sh` and `note-refs.sh "Meal Editing"`.
- **Freeze** (Flow step 2): Sarah closes Obsidian and stops other sessions, and every pending note change is committed in the code repo.
- **Split** (Piece 1, Flow step 4): `git subtree split --prefix=notes` into a temporary branch; clone it to `~/repos/meal-planning-notes` as `main`; add `.gitignore` ignoring `.obsidian/`; with Sarah's go-ahead, commit that and push `main` to the GitHub repo from Step 1. Delete the temporary branch. Copy `notes/.obsidian/` into the new folder. No ruleset on `main`.
- **Cut over** (Flow step 5), in the code repo:
  - `git rm -r notes`. The untracked `notes/.obsidian/` left behind is deleted once copied, after asking Sarah. `.gitignore` drops `/notes/.obsidian/`.
  - `scripts/notes-dir.sh` (new, Piece 4): `git rev-parse --path-format=absolute --git-common-dir` from its own folder, then the `meal-planning-notes` folder beside that checkout; if it isn't there, an error naming the path it looked for and a non-zero exit.
  - `.claude/settings.json` (new, Piece 3): `permissions.additionalDirectories` with `~/repos/meal-planning-notes`, and nothing else.
  - `.claude/hooks/notes-only-edits.sh` (Piece 6): the notes case is the path `notes-dir.sh` prints, followed by `/`; if it fails, the hook blocks and passes on its error; the block message says "the notes repo".
  - The vault scripts (Piece 5): `vault-lint.sh` works in the notes path, with its paths and `case` patterns relative to the notes repo's root; `vault-orphans.sh` looks there and reads each file's git state there; `note-refs.sh` searches the notes repo for "In the vault" and the code repo for "Outside the vault".
  - The instructions (Piece 10), every `notes/` path in `.claude/`, AGENTS.md and `docs/`, written from the notes repo's root with the repo named. AGENTS.md's opening says where the notes live and that `sh scripts/notes-dir.sh` prints the path; "Editing notes" names paths from the notes repo's root; "Git and files"' delete check reads `git status` in the repo the file is in. Who commits the notes repo is Step 10's. `/check-drift`'s `git blame` and `note-drift-checker`'s `git log`, `git status` and `git show` run as `git -C "<notes path>"`. Every skill, and AGENTS.md's "Out-of-scope work" routing step 1, that sends an agent with no Bash work that reads notes puts the notes path in its prompt. Which agents have no Bash comes from each agent's `tools:` line, not Piece 10's list: `scope-router`, `split-checker`, `decision-researcher`, `code-critic`, `plan-checker` and `target-designer` (whose callers pass absolute paths in the notes repo). `code-drift-checker` has Bash and runs `notes-dir.sh` itself. `/kickoff` and `/close` lose "so every change stays unstaged". `/final-review` runs its `git log` in the notes repo and drops "leaving out `notes/`". `/tooling` step 4 searches the notes repo, "Leave every change unstaged" is about the code repo, "Writing instructions" gets the "Note paths in instructions" convention, and its bullet on new skills and agents gets "Agents with no Bash".
  - Note Conventions' Files says its folder paths are in the notes repo. So do the other vault-relative folder paths in files Steps 3 and 4 moved into the code repo, which a grep for `notes/` misses: the `roadmap-rules` skill's "each a note in `goals/`", the Feature template's "Put images in `assets/<story-name>/`", and any other the implementer finds in `.claude/note-templates/` and the skill.
  - `docs/project_structure.md`: its `notes/` and `Roadmap.md` entries become a Notes entry: the notes live in the `meal-planning-notes` repo beside this one. Step 10 adds how they're synced.
- **Name-only corrections in the vault:** the three tech-debt notes' "Note:" lines (Data Rules Enforcement, Server-Only Creation and Pure Reads, Settings Data Refresh), [[Notes Vault Changes]]' `notes/Roadmap.md`, and [[Docs Updates]] if it still quotes a `notes/` path. Any other `notes/` mention a search of the notes repo finds, such as another story's plan or design text, is left alone and listed in the report, as AGENTS.md describes under "Editing notes".
- **Reconnect** (Setup 4): walk Sarah through opening `~/repos/meal-planning-notes` as a vault and removing the old one from the vault list.
- **Implementer:** from the main checkout and from a scratch worktree (removed after), run the three scripts and see the output recorded before the freeze, with paths now relative to the notes repo; run `note-section.sh` and see its section. Rename the notes folder for a moment and see `notes-dir.sh`, `vault-lint.sh` and the hook (run with sample JSON input) stop with its error. Run the hook with sample input for a note, a `.scratch/` file, a `docs/` file with the `docs` argument and a `src/` file, and see only the last blocked. Carry out `/final-review`'s step 2, point 1 for the story Step 6's implementer picked and see the start Step 6's check found. Grep `.claude/`, AGENTS.md, `docs/` and `scripts/` for `notes/` and see only paths inside the notes repo written from its root.
- **Commit before checks 3 and 4:** a worktree checks out a commit, so once the implementer's own runs pass, Sarah reviews the staged diff and commits the cutover in the code repo before those checks.
- Edits this step's session makes to notes after the move stay uncommitted until Step 10's plugin commits them.
- **At the end of the session:** remind Sarah that Step 9 needs to be built and pushed to `develop` before the next scheduled `dependency-updates` run, and give its day and time from the workflow's schedule. If it can't be done by then, she disables that workflow in GitHub Actions until Step 9 is pushed. The reason is the same as for firing it by hand.

**Files:**
- `notes/` (deleted) - moved to the notes repo
- `.gitignore` - drops `/notes/.obsidian/`
- `scripts/notes-dir.sh` (new) - prints the notes repo's path
- `.claude/settings.json` (new) - gives sessions access to the notes folder
- `.claude/hooks/notes-only-edits.sh` - allows edits in the notes repo
- `scripts/vault-lint.sh`, `scripts/vault-orphans.sh`, `scripts/note-refs.sh` - look in the notes repo
- `AGENTS.md` - where the notes live, note paths, and the notes path in the `scope-router` hand-off
- `.claude/skills/*/SKILL.md` that name `notes/` (about 20: `close`, `shape`, `tooling`, `roadmap`, `check-drift`, `plan-steps`, `investigate`, `infra-design`, `implement`, `decide`, `architect`, `kickoff`, `final-review`, `assess`, `roadmap-placement`, `retyping-a-note`, and any other the grep finds) - point at the notes repo
- `.claude/agents/*.md` that name `notes/` (`scope-router`, `split-checker`, `note-drift-checker`, `decision-researcher`, `code-drift-checker`, `code-critic`) - point at the notes repo, or run git there
- `.claude/rules/note-conventions.md` - Files names the notes repo
- `.claude/skills/roadmap-rules/SKILL.md`, `.claude/note-templates/Feature.md` - their folder paths name the notes repo
- `docs/project_structure.md` - the Notes entry
- In the notes repo: the notes with name-only corrections

**Acceptance:**
- [ ] Open the vault in Obsidian from `~/repos/meal-planning-notes`. See the same settings and layout as before, and the Roadmap's status embeds rendering. In the code repo, see no `notes/` folder. Proves: Obsidian keeps the vault as it was, from its new home, and the code repo no longer holds notes.
- [ ] Run `git -C ~/repos/meal-planning-notes log --oneline -- Roadmap.md | tail -3` and `git -C ~/repos/meal-planning-notes blame Roadmap.md | head`. See commits and dates from before the move. Proves: `/check-drift` and `note-drift-checker` still see when each line changed.
- [ ] Start a new Code-tab session in a worktree (the app's worktree option). Ask it to create a throwaway note with one line in `features/` in the notes repo, then run `vault-lint.sh` naming it. See no prompt for access to `~/repos/meal-planning-notes` (an ordinary approval of the edit itself is fine), the note appear in Obsidian, and the lint report "no ^status line under Where It Stands" for that note. Proves: a worktree session reaches the one copy of the notes, and the scripts work from a worktree.
- [ ] In a new main-checkout session, run `/shape` on that throwaway note. When it first edits the note, see the edit go through, and stop it there. Then ask it to add a blank line to `README.md`, see it blocked with a message naming the notes repo. Stop the session, delete the throwaway note, and undo any other note it touched, such as the Roadmap. Proves: a planning skill can edit notes in the notes repo and still can't edit code.

## Step 9: Routines push their note changes to the notes repo
**Idea:** The `dependency-updates` routine's session pushes its sweep items to the notes repo's `main` instead of its PR's branch.

**Source:** Piece 13; Piece 14; Setup 3; Convention: "Routines that change notes"; Flow, "A note edited by a routine"; Flow failure: "A routine's rebase conflicts"; Goals: the vault scripts work in a routine; any note a routine's session changes reaches the notes repo's `main`; a `dependency-updates` run with only notes changes opens no PR.

**Approach:**
- `routine-sessions` (Piece 13): Branches says a session pushes only to `claude/` branches in the code repo and only to `main` in the notes repo; before pushing notes it runs `git pull --rebase`, retries if the push is rejected, and stops without pushing if the rebase conflicts, saying which notes conflicted. Boy Scout fix: "a push to any other branch is checked first and can be rejected" goes (found by /decide on decision 2, 2026-10-04). What the Session Does: a routine that edits notes has both repos selected, starts above the two clones, and `cd`s into the code clone before running scripts.
- `dependency-updates` `SKILL.md` (Piece 14), as [[Major Upgrade Sweeps]] leaves it: sweep items are written in the notes clone (path from `notes-dir.sh`), `vault-lint.sh` runs naming the sweep notes changed, and the session commits in the notes repo and pushes as `routine-sessions` says. A run whose only changes are notes cuts no branch and opens no PR. The summary names the sweep items that reached the notes repo, with the commit.
- `routine.md`'s Repositories: `meal-planning` and `meal-planning-notes`. `docs/ci.md`: "The Claude GitHub App" says routines push `claude/` branches in `meal-planning` and `main` in `meal-planning-notes`; the `dependency-updates` entry under "Routines" changes if it says where sweep items go.
- Walk Sarah through Setup 3: add `meal-planning-notes` to the routine's repositories, and turn on a per-repo "Allow unrestricted branch pushes" toggle for it if the form has one.
- **Implementer:** test the push steps against two local clones of a scratch bare repo, never the real notes repo: a push the other clone got in first is rejected, and the session's steps pull and push again; a rebase that conflicts stops with nothing pushed.
- The run's sweep item reaches the local vault once Step 10's plugin pulls it, merged with the local edits made since Step 8.
- **Before the check:** Sarah commits this step and pushes it to `develop`, since the routine runs the skills as they are there.
- **The check's run:** the implementer writes a payload with one real, available major of a package that has no sweep item, so the item it leaves on `main` is a real one, and Sarah fires the routine with `curl`, regenerating the token as [[Major Upgrade Sweeps]]' check did if she has no copy.

**Files:**
- `.claude/skills/routine-sessions/SKILL.md` - pushes to the notes repo's `main`, and the Boy Scout fix
- `.claude/skills/dependency-updates/SKILL.md` - sweep items go to the notes repo
- `.claude/skills/dependency-updates/routine.md` - both repos
- `docs/ci.md` - what routines push in each repo

**Acceptance:**
- [ ] Fire the routine with the one-major payload. In its session, see `vault-lint.sh` run on the sweep note and its item committed and pushed to the notes repo's `main` (the commit on github.com), with no change to `claude/dependency-updates` and no PR opened. Proves: a routine's note changes reach the notes repo's `main`, the vault scripts work in a routine, and a run with only notes changes opens no PR.

## Step 10: Obsidian Git syncs the vault
**Idea:** The Obsidian Git plugin keeps the vault in sync with the notes repo's `main`.

**Source:** Piece 2; Setup 5; Convention: "Committing notes"; Goals: the Obsidian Git plugin installed alongside the vault's settings; an edit in Obsidian reaches `main` without Sarah committing it, and pushes to `main` show up locally without her pulling; Flow, "A note edited on Sarah's Mac" step 3; Flow failure: "Obsidian is closed".

**Approach:**
- Walk Sarah through Setup 5: install Obsidian Git from Community plugins, then set Piece 2's settings: auto commit-and-sync interval 5 minutes, "Auto commit-and-sync after stopping file edits" on, auto pull interval 5 minutes, "Pull on startup" on, sync method `merge`, the default commit message.
- `docs/project_structure.md`'s Notes entry adds that Obsidian Git syncs the notes, with those settings, and that when something needs edits on GitHub before the plugin's next sync, such as a routine or a cloud session that reads them, Sarah runs Obsidian Git's Commit-and-sync command by hand.
- AGENTS.md "Git and files" (the "Committing notes" convention): "Don't commit unless Sarah asks" covers the code repo. Obsidian Git commits the notes repo locally, and routines as their skills say, so a local session never commits or pushes it.
- The plugin's first commit picks up the edits sessions made since Step 8.

**Files:**
- `docs/project_structure.md` - the Notes entry says how the notes are synced
- `AGENTS.md` - "Git and files" says who commits the notes repo

**Acceptance:**
- [ ] Create a note `Sync Check` at the vault's top level in Obsidian, with one line, and stop typing. Within about five minutes, see a `vault backup:` commit adding it on `main` at github.com. Proves: Sarah's edits reach GitHub without anyone committing them.
- [ ] Add a line to `Sync Check` on github.com and commit it to `main`. Within about five minutes, see the line in Obsidian without pulling. Proves: what routines push reaches the local vault on its own.
- [ ] Close Obsidian. In a Code-tab session, ask it to add a line to `Sync Check`. Open Obsidian, and within about five minutes see a `vault backup:` commit with that line on github.com. Then delete `Sync Check` in Obsidian. Proves: a session's edits made while Obsidian is closed wait in the folder and reach GitHub once it opens.

## Step 11: `vault-lint.sh` reports merge conflicts
**Idea:** `vault-lint.sh` reports any line in the vault that starts with `<<<<<<<`.

**Source:** Piece 5, the conflict check; Flow failure: "The plugin's pull conflicts".

**Approach:**
- A whole-vault check in `vault-lint.sh`: each line starting with `<<<<<<<`, reported with its file and line. The message says it's a merge conflict from Obsidian Git for Sarah to resolve in Obsidian, so a session tells her rather than resolving it, even in a note it changed.

**Files:**
- `scripts/vault-lint.sh` - the conflict check

**Acceptance:**
- [ ] With Obsidian closed, add a line `<<<<<<< HEAD` to a note. Run `sh scripts/vault-lint.sh` with no arguments, see the note and line reported as a merge conflict to resolve in Obsidian. Remove the line before opening Obsidian. Proves: a session sees a conflict the plugin left and tells Sarah instead of editing around it.
