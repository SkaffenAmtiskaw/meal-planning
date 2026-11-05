---
type: infra
status: ready
blocked-by: []
confirmed: 2026-11-04
---
# Where It Stands

Ready. Next: /infra-build ^status

Shaped 2026-10-04, with five decisions settled on 2026-10-04 and 2026-10-05. `/infra-design` revised it on 2026-10-06 and again on 2026-11-04, after `/check-drift`. The second revision moved Note Conventions' home outside `.claude/rules/`, reworked the `dependency-updates` Piece for Roadmap lines and notes that don't wait on the code, and kept the 8-step Build Order. Nothing is built yet.

# Inbox

# Purpose
Move the notes vault out of the code repo into its own git repo, so notes are never branched. Split from [[Branching and Releases]], which waits on it. That story decided 2026-10-04 that the vault moves to its own git repo in a folder beside the code repo (outside its checkouts), that Obsidian points at it, that every session reaches it through Claude Code's `additionalDirectories` setting, and that notes are never branched.

# Goals
- [ ] Checking out another branch in the code repo, or working in a worktree, leaves the notes as they are: there's one copy of every note, outside the code repo's checkouts.
- [ ] Obsidian opens the vault from `~/repos/meal-planning-notes` with the settings and plugins it has today.
- [ ] An edit Sarah makes in Obsidian reaches `main` of the `meal-planning-notes` GitHub repo without her committing it.
- [ ] Changes pushed to the notes repo's `main`, such as a routine's, show up in Sarah's local vault without her pulling them.
- [ ] Every local Claude Code session, worktree sessions included, reads and edits notes in `~/repos/meal-planning-notes` without a permission prompt for that folder.
- [ ] `git blame` and `git log` on a note in the notes repo show its history from before the move, so `/check-drift` and `note-drift-checker` still see when each line changed.
- [ ] The notes repo holds only notes and their files. Note Conventions, the templates and the Roadmap's rules live in the code repo.
- [ ] Any note a routine's session adds or changes reaches the notes repo's `main`, never a code branch. The `dependency-updates` routine's sweep items and Roadmap lines are the first case.

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
   - **Decided 2026-11-04:** Note Conventions moves into the code repo as a real file at `.claude/note-conventions.md`, read on demand, beside the templates in `.claude/note-templates/`. Sarah decided 2026-10-06, in the Agent Instructions Audit, that it loads on demand (built in 6a2a0c7), so it needs no loading mechanism.
     - Rejected: `.claude/rules/note-conventions.md`, loaded through `paths` frontmatter - Sarah's 2026-10-05 answer, which that decision replaced.
     - Rejected: keep it in the vault and load it another way - the symlink that loaded it broke across repos, and decision 1 keeps the vault to notes.
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
1. **The notes repo** - `~/repos/meal-planning-notes`, and a private GitHub repo `meal-planning-notes`. Holds the vault (the notes and their files) with its full history. ^piece-1
   - Made with `git subtree split --prefix=notes` in the code repo. It ships with git and rewrites only the commits that touched `notes/`, keeping each commit's author and date, so `git blame` and `git log` still show when each line changed. The new repo's `main` starts from that history.
   - Its `.gitignore` ignores all of `.obsidian/`, as the code repo does today, which keeps Obsidian's workspace churn and the plugin's settings out of the auto-commits.
   - `main` has no ruleset, since a PR rule would block the plugin's pushes (decision 2).
2. **The Obsidian Git plugin** - installed in the vault's `.obsidian/plugins/`, untracked. Commits and pushes note edits (Sarah's and local sessions') to the notes repo's `main`, and pulls in what routines push. Installed from Community plugins without changing the vault's other settings or plugins. Settings (defaults from the plugin's `DEFAULT_SETTINGS` in `src/constants.ts`): ^piece-2
   - Auto commit-and-sync interval 5 minutes (`autoSaveInterval`, default 0, off), with "Auto commit-and-sync after stopping file edits" on (`autoBackupAfterFileChange`), so the timer starts once edits stop and is less likely to commit an agent's change halfway through.
   - Auto pull interval 5 minutes (`autoPullInterval`, default off) and Pull on startup on (`autoPullOnBoot`, default off), so routine pushes reach the vault.
   - Sync method `merge`, the default: conflict recovery is simpler than with `rebase`, which can leave the repo stuck mid-rebase. The cost is an occasional merge commit, which nothing that reads the notes' history minds.
   - Commit message left at the default `vault backup: {{date}}`. Nothing reads note commit messages.
3. **`.claude/settings.json`** (new, tracked) - gives every local session access to the notes folder with no prompt for the folder: `"permissions": { "additionalDirectories": ["~/repos/meal-planning-notes"] }`, and nothing else. ^piece-3
   - It applies only once the folder's workspace trust dialog is accepted, and editing a file there still follows the session's permission mode (code.claude.com/docs/en/permissions).
   - An app worktree session reads settings from the main checkout's root (code.claude.com/docs/en/worktrees), so one copy serves every worktree.
   - The docs don't state that this key expands `~`. If Step 6's check shows it doesn't, the entry becomes the absolute path, which is fine because the setting only has to work on Sarah's Mac.
   - Routines don't read it: a session with several repos starts above the clones and reads only the plugin keys from each repo's settings (code.claude.com/docs/en/settings, "Settings in cloud sessions"). So it only has to agree with `notes-dir.sh` on Sarah's Mac.
4. **`scripts/notes-dir.sh`** (new) - prints the notes repo's absolute path, the one place everything finds it (decision 5). ^piece-4
   - From its own folder, it runs `git rev-parse --path-format=absolute --git-common-dir`, which gives the main checkout's `.git` from the main checkout and from any worktree, and takes the `meal-planning-notes` folder beside that checkout. In a routine, that's the notes clone beside the code clone.
   - If the folder isn't there, it prints an error naming the path it looked for and exits non-zero, so a caller stops instead of working on nothing.
   - The vault scripts, the hook, and git commands on notes in skills call it, and AGENTS.md's Project line says it exists. An agent gets the path from its caller.
5. **The six vault scripts** - still check and search the vault; what changes is where they look. Each works on the notes repo when run from the main checkout, from a worktree or in a routine. ^piece-5
   - `vault-lint.sh` gets the notes path from `notes-dir.sh` and works there, with its paths and `case` patterns relative to the notes repo's root. Its exclusions for `templates/` and Note Conventions go. Its Roadmap section names and markers stay as they are.
     - **Named notes only:** its per-note checks cover only the notes named as arguments. The session names each note it changed, and the `git status` fallback goes, since the plugin commits edits within minutes. Sarah decided this 2026-10-05 over diffing from a starting point, which needs a SessionStart hook routines don't run and picks up other sessions' notes. With no arguments it runs only the whole-vault checks, and its last line says no notes were named, so only those ran. The Roadmap, if named, gets no per-note checks: it has no `^status` line or Where It Stands, and the whole-vault checks cover it. Its header comment says how it works now.
     - **Merge conflicts:** a whole-vault check reports each line starting with `<<<<<<<` (a plugin merge conflict), with its file and line. The message says it's a merge conflict from Obsidian Git for Sarah to resolve in Obsidian, so a session tells her rather than resolving it, even in a note it changed.
   - `vault-orphans.sh` looks in the notes repo and reads each orphan's git state there. Its `templates/` exclusion and the comment about it go.
   - `note-refs.sh` searches the notes repo for "In the vault" and the code repo (`src`, `test`, `docs`, `scripts`, `.github`, `.claude`, AGENTS.md, CLAUDE.md) for "Outside the vault". Its `templates/` exclusions go.
   - `user-comments.sh` finds the note in the notes repo and runs its `git ls-files` and `git blame` there, since `git ls-files` run in the code repo would make every note read as uncommitted. Its `templates/` exclusion goes.
   - `story-range.sh` finds the note in the notes repo and takes the first commit that marked a step done from the notes repo's history, as [[#^piece-11|Piece 11]] describes. Its `:(exclude)notes` pathspecs and `templates/` exclusion go, since the code repo no longer holds notes.
   - `note-section.sh` reads `.claude/note-conventions.md` in the code repo and doesn't need the notes path.
6. **`.claude/hooks/notes-only-edits.sh`** - still lets a planning skill edit only notes, `.scratch/`, Claude's memory and the code-repo folders the skill names (such as `docs`). The `$CLAUDE_PROJECT_DIR/notes/` case becomes the path `notes-dir.sh` prints, followed by `/`. `.scratch/` and named folders are relative to the checkout the session works in, from `git rev-parse --show-toplevel` in the hook input's `cwd`, since in an app worktree session `$CLAUDE_PROJECT_DIR` is the main checkout (Sarah's call). If `notes-dir.sh` fails, the hook blocks the edit and passes on its error. The block message says "the notes repo". The 15 skills that register it keep their frontmatter. A planning skill can still edit notes, now in the notes repo, and is still blocked from editing code. ^piece-6
7. **Note Conventions, at `.claude/note-conventions.md`** - the workflow map, read on demand. It's moved with `git mv` in a commit of its own, and edited in the next, so `git log --follow` follows its history. ^piece-7
   - Its wikilinks become plain names ("The Roadmap", `Meal Editing`). The `[[link]]` format examples in the frontmatter table stay.
   - "Each note type's template is in `templates/`" becomes `.claude/note-templates/`.
   - Wording that places it in the vault goes.
   - Files says its folder paths (`features/<area>/`, `goals/`, `archive/`, `assets/`) are in the notes repo.
   - Every path to it changes with the move: `scripts/note-section.sh` (its `file` and comment), the `editing-notes` skill, `/shape` step 1, `/tooling` step 2, and any other a grep finds. `/decide`, `filing-work`, `keeping-sessions-lean` and `rule-placement` name it without a path, so they stay.
8. **The templates, at `.claude/note-templates/`** - the 12 note templates, moved with `git mv` from `notes/templates/`. Under `.claude/` with the rest of the workflow. The skills and agents that read a template keep reading the one they need by path. ^piece-8
   - Every path to them changes with the move: `split-checker`, `/brainstorm`, `/decide`, `filing-work`, `/gather-goal`, `/place-design`, `/shape` with `making-a-hub.md` and `splitting.md`, `/tooling` with `spinning-off-a-story.md`, Note Conventions' Templates line, and any other a grep finds.
   - The Feature template's "Put images in `assets/<story-name>/`", and any other vault folder path in a template, names the notes repo.
   - The vault's `.obsidian/templates.json` setting goes, since Sarah doesn't insert templates in Obsidian. It's untracked, so Sarah is asked before it's deleted.
9. **The `roadmap-rules` shared-rule skill, at `.claude/skills/roadmap-rules/SKILL.md`** - holds the Roadmap's rules, "How this file works" (lines 3-29 of `Roadmap.md` today), moved word for word apart from link-to-name swaps and the 🚨 marker, which drops "which the user sees in its pull request". `user-invocable: false`. Its description covers what `roadmap-placement`'s doesn't: how the Roadmap is laid out, how goals order its work and what its markers mean, for use when deciding whether a story can be built yet or what a section or marker means. Sarah decided this 2026-10-05 over a section in Note Conventions, following `rule-placement`'s rule that an agent rule several skills share but that doesn't belong in every session gets its own skill. The Roadmap keeps line 1 and gets one plain-text line in place of the section: "How this file works: the `roadmap-rules` skill in the meal-planning repo." ^piece-9
   - These point to it by name in place of "How this file works": `/implement`, `/infra-build`, `/tooling` step 1, `/roadmap`'s `filling-the-queues.md` and `roadmap-placement`. `rule-placement`'s rule on where the Roadmap's rules live names it too, and `vault-lint.sh`'s comment points to it.
   - The `[[Goal]]` in the marker formats stays, as a format example. The skill's "each a note in `goals/`" names the notes repo.
   - `/roadmap` step 1 reads the Roadmap and the skill.
   - `scope-router`, which suggests Roadmap lines, and `split-checker`, which writes children's lines, each preload the skill with `skills:` in their frontmatter, as `rule-placement` describes for shared-rule skills, and so does any other agent a grep finds relying on the Roadmap's rules.
   - Name-only corrections in the vault: [[Notes Vault Changes]]' "Rename the Roadmap's 'Ideas' section" item says "the 'How this file works' bullet", which becomes "the `roadmap-rules` skill's bullet", and [[Agent Workflow Changes 2026-10-02]]'s "A light path for small note-less work" item says "the Roadmap's 'How this file works'", which becomes "the `roadmap-rules` skill".
10. **The instructions that name note paths** - every skill, agent, AGENTS.md line and doc that names `notes/` (about 133 strings in about 41 files) points at the notes repo instead, written once during the build. ^piece-10
    - Paths are written from the notes repo's root, saying which repo, such as "`features/` in the notes repo".
    - AGENTS.md's Project line becomes: "Work is planned and tracked as notes in the Obsidian vault in the `meal-planning-notes` repo beside this one, and `sh scripts/notes-dir.sh` prints its path. Obsidian Git commits and pushes that repo, so a local session never does." (Sarah's call.) "Git and Files" stays as it is. "Before you finish": `sh scripts/vault-lint.sh "<note>" …`, naming each note the session changed.
    - Git commands on notes run as `git -C "<notes path>"`. Sarah ran both `git -C <path>` and `git -C "$(...)"` on another repo from an app worktree session on 2026-11-04, and neither was blocked.
    - Agents get the notes path in their caller's prompt, whichever tools they have, so one rule covers all of them. That's every agent that reads notes, step 3 of the `triaging-out-of-scope-work` skill included. `code-drift-checker`, `note-drift-checker` and `leftovers-checker` keep their limit to read-only git, and it names the `git -C` form.
    - `.claude/launch.json`'s `design-files` runs through a shell, since its arguments can't call a script: `"runtimeExecutable": "sh"`, `"runtimeArgs": ["-c", "pnpm dlx http-server@14.1.1 \"$(sh scripts/notes-dir.sh)/assets\" -p 3002 -c-1 -s"]`.
    - `docs/project_structure.md` replaces its `notes/` and `Roadmap.md` entries with a Notes entry: the notes live in the `meal-planning-notes` repo beside this one, synced by Obsidian Git with [[#^piece-2|Piece 2]]'s settings, and when something needs edits on GitHub before the plugin's next sync, such as a routine or a cloud session that reads them, Sarah runs Obsidian Git's Commit-and-sync command by hand. `.gitignore` drops `/notes/.obsidian/`.
    - The notes that quote `notes/` paths get name-only corrections: the three tech-debt notes' "Note:" lines (Data Rules Enforcement, Server-Only Creation and Pure Reads, Settings Data Refresh), [[Notes Vault Changes]]' `notes/Roadmap.md`, and [[Docs Updates]] if it still quotes one. Any other `notes/` mention a search of the notes repo finds, such as another story's plan or design text, is left alone and listed in the build report, as the `editing-notes` skill describes.
11. **`/final-review`'s range, in `scripts/story-range.sh`** - still proposes the story's code range for Sarah to confirm, and for a story with ✅ steps it proposes the same start commit the old method found. It runs the same `git log --follow -S'**Status:** ✅ Complete'` in the notes repo to find the first commit that marked a step done and takes its full committer timestamp (`%cI`, since `--before` filters on the committer date and a day alone would depend on the time of day it runs). The proposed start is the parent of the last code-repo commit at or before that time (`git log -1 --before=<timestamp>`). Before the cutover, the notes share the code repo's history, so the date method already finds the same commit; the cutover points its `git log` at the notes repo. Listing the commits just before the range stays. The plugin commits the ✅ within minutes, so the date tracks when the step was marked done. The script's comment says this is interim until [[Branching and Releases]] replaces it with the story branch's range. ^piece-11
12. **`/tooling`** (`.claude/skills/tooling/SKILL.md`) - step 1 searches the notes repo and names `roadmap-rules` in place of "How this file works". Step 2 searches the repo, including `.claude/note-conventions.md` and `.claude/note-templates/`, and step 5's "all of `notes/`" becomes the notes repo. Holding Roadmap edits (decision 4): an edit to existing Roadmap lines or sections that the change causes, such as renaming a section, isn't made with the rest of step 3. `/tooling` lists each one in its step 6 report under "Roadmap edits to apply after the commit", and when Sarah asks that session to commit, it commits the code repo change first, then makes those edits and runs `vault-lint.sh`. Until [[Branching and Releases]] gives `/tooling` a branch and a PR, the commit to `develop` is when the skills go live; that story moves this to "after its PR merges". Story progress still updates the Roadmap right away. `vault-lint.sh` changes in the same commit as the skills. ^piece-12
13. **The `routine-sessions` skill and `docs/ci.md`** - the shared rules for a routine's session, and the record of the GitHub setup. ^piece-13
    - Branches: "In the code repo, commit and push only to branches whose names start with `claude/`. Never merge one branch into another on GitHub, such as by merging a pull request, because a session's code reaches another branch only after the user has reviewed it. In the notes repo, commit and push only to `main`, since nothing there goes through a pull request. Run `git pull --rebase` before pushing. If the push is rejected because Obsidian Git pushed in between, pull and push again. If the rebase conflicts, look at what each side changed. If both changes can stand together, such as both sides adding lines or a list that needs renumbering, resolve it and go on. If they say different things about the same content, stop without pushing and say which notes conflicted." The conflict rule is Sarah's call. The docs say the proxy doesn't limit which branches a push can update, so the old reason about pushes being rejected goes.
    - What the Session Can Use: "The session has only the repos its routine selects, as last pushed, and its cloud environment. A routine that edits notes selects both repos. Its session starts above the two clones, so its skill `cd`s into the code clone before running scripts, which find the notes clone through `notes-dir.sh`."
    - `writing-a-routine.md`'s "the repo as last pushed" changes to match.
    - `docs/ci.md`, "The Claude GitHub App": the app has access to both repos; routines push `claude/` branches in `meal-planning` and `main` in `meal-planning-notes`.
14. **The `dependency-updates` skill and its `routine.md`** - every note the sweep rule writes goes in the notes clone and reaches the notes repo's `main`, whatever happens to the code. [[Dependency Release Analysis]] changes this skill first, so the implementer re-reads it before building. ^piece-14
    - **Paths:** `sweep-rule.md` and `security-fixes.md` look in the notes repo. If there's no collecting sweep, the Roadmap line goes in the notes repo's Roadmap.
    - **Pushing:** each time the sweep rule finishes, at step 4 and again after a drop in `failed-on-github.md`, if any note changed, the session runs `vault-lint.sh` naming each one, fixes what it reports, commits in the notes repo and pushes to `main` as `routine-sessions` says.
    - **Notes don't wait on the code:** a merge conflict with `develop` or a rejected code push doesn't hold them back. `sweep-rule.md`'s opening case goes, and **Not applied** holds a note's text only if the notes push itself stops on a conflict.
    - **A security line:** it goes first in Next "unless the user moves it", and the session renumbers Next, so the numbers always run in order (Sarah's call: she doesn't want a rule that leaves the numbering out of order, and a numbering conflict is easy to resolve).
    - **No PR for notes alone:** a run whose only changes are notes opens no PR. The session still checks out the branch at step 2, before it knows what the run will do, so a notes-only run skips the push and the PR rather than cutting no branch. Step 5 skips when step 3 left no commit.
    - **What goes, because it can't happen any more:** step 2's `notes/Roadmap.md` conflict handling, the summary's "Only step 4 left a commit" case, and in `failed-on-github.md` the notes-only case and the cherry-picking of notes commits after a drop.
    - **The pull request's body:** it lists only updates and drops, and its `git diff … -- notes` source goes.
    - **Summary:** it names each sweep item or Roadmap line that reached the notes repo, with the commit.
    - `routine.md`'s Repositories becomes `meal-planning` and `meal-planning-notes`. `docs/ci.md`'s `dependency-updates` entry changes too if it says where sweep items go.

## Flow
**A note edited on Sarah's Mac:**
1. Sarah edits a note in Obsidian, or a local session (main checkout or worktree) does. A session gets the path from [[#^piece-4|Piece 4]] and edits with no prompt for the folder through [[#^piece-3|Piece 3]]. A planning skill's hook ([[#^piece-6|Piece 6]]) lets the edit through because it's in the notes repo.
2. Before it finishes, the session runs `sh scripts/vault-lint.sh` naming each note it changed, and fixes what's reported in those notes.
3. Five minutes after edits stop, [[#^piece-2|Piece 2]] commits everything changed in the vault and pushes it to `main`, pulling first.
4. A checkout of another branch, or a worktree, in the code repo touches none of it.

**A note edited by a routine:**
1. The trigger fires. The session clones `meal-planning` and `meal-planning-notes` on their default branches and starts above them.
2. It `cd`s into the code clone and does its code work there, on a `claude/` branch if it changes code.
3. It edits notes in the notes clone (found through [[#^piece-4|Piece 4]]), runs `vault-lint.sh` naming them, and commits in the notes repo.
4. It runs `git pull --rebase` and pushes to the notes repo's `main`, as [[#^piece-13|Piece 13]] says. A PR is opened only if it changed code.
5. Within five minutes, the plugin's auto pull brings the change into Sarah's vault, or at Obsidian's next startup if it's closed.

**When something fails:**
- **`notes-dir.sh` can't find the notes folder:** it names the path it looked for and exits non-zero. A script stops, the hook blocks the edit, and the session tells Sarah.
- **Obsidian is closed:** edits stay uncommitted in the folder, and the plugin commits them when Obsidian next opens. If something needs them on GitHub first, such as a routine or a cloud session that reads them, Sarah runs Obsidian Git's Commit-and-sync command by hand.
- **The plugin's pull conflicts:** the note gets conflict markers, and the plugin stops auto-committing until they're resolved. Sarah resolves them in Obsidian and runs Commit-and-sync. `vault-lint.sh` reports any line starting with `<<<<<<<`, so a session sees the conflict and tells her instead of editing around it.
- **A routine's rebase conflicts on what can't stand together:** it doesn't push its notes. It stops, says which notes conflicted, lists under **Not applied** what each item would have said, and waits for Sarah in the session.

**The one-time move:**
1. **Before building:** one test cloud session with both repos confirms that the clones sit side by side, what `$CLAUDE_PROJECT_DIR` is there, and that the session sees the code repo's skills and AGENTS.md, since the routine's whole prompt names a skill and the docs don't say how skills resolve from above two clones.
   - It runs on the `Meal Planning Routines` environment with both repos selected, and prints `pwd`, a listing of the working folder and its parent, `$CLAUDE_PROJECT_DIR`, and `git rev-parse --show-toplevel` in each clone, then lists its skills and says whether it sees `dependency-updates` and AGENTS.md's text. If the session form takes only one repo, a throwaway routine with both repos and the same environment is run once with "Run now", then deleted.
   - If claude.ai won't attach or clone the empty notes repo, the clones aren't siblings or the session can't see the skill, building stops and the finding goes to Sarah, since `notes-dir.sh`'s routine case and the routine's prompt depend on them.
   - The environment's setup script finds the repo with `find / -maxdepth 4` (`docs/ci.md`, "The Cloud Environment"). If the code clone's `mise.toml` sits deeper than that, building stops the same way, since every routine with both repos would fail its setup.
2. **Out of the vault first:** Note Conventions, the templates and the Roadmap's rules move into the code repo in commits of their own, so the vault's history ends with them gone. Each move changes a file skills read, so no other Claude Code session runs until it's committed.
3. **Freeze:**
   - Any open PR whose branch changes `notes/`, such as a `claude/dependency-updates` PR carrying sweep items, is merged or closed, so nothing brings `notes/` back.
   - No other Claude Code session runs until the cutover is committed and Obsidian opens the new folder. A note edited in `notes/` after the split is lost, and a session started before the cutover has the old instructions loaded, so it would write to `notes/` and bring the folder back.
   - No worktree made before the cutover still has work in it, since it has its own `notes/`. Sarah finishes or removes those first, and makes new ones afterwards.
   - The Dependency Updates workflow is turned off with `gh workflow disable dependency-updates.yml` before the split, and stays off until [[#^piece-13|Pieces 13]] and [[#^piece-14|14]] are on `develop`. A run in between couldn't reach the notes, and the check doesn't report a version twice, so what it found would be lost. The implementer runs the command with Sarah's OK.
   - Obsidian is closed and every pending note change is committed in the code repo.
4. **Split:** `git subtree split --prefix=notes` makes the history in a temporary branch, deleted afterwards. `~/repos/meal-planning-notes` is cloned from it as `main`, given its `.gitignore`, and pushed to the new GitHub repo with Sarah's go-ahead. The untracked `notes/.obsidian/` is copied in, so Obsidian keeps its settings, then deleted from the code repo after asking Sarah.
5. **Cut over in one commit:** the code repo drops `notes/` and takes the settings file, `notes-dir.sh`, the scripts, the hook and the rewritten instructions together, so no commit has skills pointing at a folder that isn't there yet. It's committed before anything is checked from a worktree, since a worktree checks out a commit. Note edits made after it stay uncommitted until the plugin is installed and commits them.
6. **Reconnect:** Obsidian opens the new folder and gets the plugin, and the GitHub App and the `dependency-updates` routine get the notes repo (Setup Outside the Repo). Once [[#^piece-13|Pieces 13]] and [[#^piece-14|14]] are on `develop`, the implementer turns the workflow back on, as Step 7's check needs it.

## Build Order
Steps 1 to 5 change the code repo while the notes are still in `notes/`, and each leaves everything working, so each is committed on its own. Step 6 moves the sweep notes the `dependency-updates` skill writes, and Step 7 changes that skill. Sarah decided 2026-10-05 that [[#^piece-13|Pieces 13]] and [[#^piece-14|14]] get a step of their own rather than joining the cutover's commit, and that it comes right after the cutover, since it needs nothing from Step 8 and it closes the gap in which the Dependency Updates workflow stays off. She also decided that the conventions on note paths and on agents that read notes go in with the cutover, so no `/tooling` change after it writes `notes/` paths again.

- **Decided 2026-11-04:** Step 7's check clears the reported list and starts the weekly Dependency Updates run with `gh`. Re-reported majors refresh their sweep items, so the run's notes reach `main`. A notes-only run isn't tested, since it takes the skill's path for a run that leaves no commit on the branch, and a mistake there costs little, so the implementer checks it by reading the skill. Sarah's call.
  - Rejected: testing the notes-only case on its own in scratch clones - it needs scratch bare repos and a local run of the skill to cover a path the skill already has.
  - Rejected: firing the routine with `curl` and a crafted one-major payload - it needs the routine's token regenerated and the Actions secret that holds it updated. **Run now** has no text field, as Sarah checked 2026-11-04, so it can't carry a payload.

### Step 1: A cloud session clones the notes repo beside the code repo
**Builds:** [[#^piece-1|Piece 1]]'s GitHub repo, still empty, and [[#^piece-13|Piece 13]]'s `docs/ci.md` line on the Claude GitHub App's access
**Setup first:** Setup 1 (the GitHub repo) and Setup 2 (the Claude GitHub App's access)
**Implementer checks:**
- `docs/ci.md`, "The Claude GitHub App", says the app has access to `meal-planning` and `meal-planning-notes`. What routines push in each repo is Step 7's.
- From the test session's output, the code clone's `mise.toml` sits within the environment setup script's `find / -maxdepth 4`. If it doesn't, stop and bring it to Sarah.
- From the test session's output, the session lists the `dependency-updates` skill and quotes AGENTS.md's text. If it doesn't, stop and bring it to Sarah, since the routine's prompt names that skill.
- The two clone paths and `$CLAUDE_PROJECT_DIR` are recorded in this step's As built note, for Steps 6 and 7.

**Sarah checks:**
- [ ] Start a session at https://claude.ai/code on the `Meal Planning Routines` environment with `meal-planning` and `meal-planning-notes` selected, and paste the prompt `/infra-build` gives you in chat. If the form takes only one repo, `/infra-build` walks you through a throwaway routine instead. See the clones of the two repos listed as two folders under one parent, and the `dependency-updates` skill in its list of skills, and paste the output back into the `/infra-build` session. Goal: any note a routine's session adds or changes reaches the notes repo's `main` (the clone layout and skill it relies on).

### Step 2: Note Conventions, the templates and the Roadmap's rules move into the code repo
**Builds:** [[#^piece-7|Pieces 7]], [[#^piece-8|8]] and [[#^piece-9|9]], apart from the notes repo's folder paths (Step 6)
**Setup first:** none
**Implementer checks:**
- Before changing anything, record the output of `sh scripts/vault-lint.sh` (no arguments), `sh scripts/vault-orphans.sh`, `sh scripts/note-refs.sh "Meal Editing"` and `sh scripts/user-comments.sh "Grocery List Integration"`. After, each gives the same output.
- `sh scripts/note-section.sh "Lifecycle"` prints the section from `.claude/note-conventions.md`.
- Every template path the instructions name exists.
- Once the Note Conventions move is committed, `git log --follow --oneline -- .claude/note-conventions.md` shows commits from before the move that changed `notes/Note Conventions.md`.

**Sarah checks:**
- [ ] In a new Code-tab session, ask: "What does a note's `confirmed` property record, and when isn't it bumped?" See it read `.claude/note-conventions.md` and answer, including that moves, renames and link fixes don't bump it. Goal: Note Conventions, the templates and the Roadmap's rules live in the code repo (Note Conventions).
- [ ] In a new Code-tab session, ask: "Send the scope-router subagent this one item: Let users export a week's meal plan as a PDF: pick the week, choose whether to include recipes and shopping lists, and decide whether it's generated in the browser or on the server, which is still open. Found while planning Notes Vault Repo; it's new app behavior, outside a tooling story." See it suggest a new idea note drafted from a template, and in the agent's tool calls a read of a file in `.claude/note-templates/`. Goal: Note Conventions, the templates and the Roadmap's rules live in the code repo (the templates).
- [ ] In a new Code-tab session, ask: "A new sweep note was just created. Where does its Roadmap line go?" See it load the `roadmap-rules` skill and answer: in Unaffiliated in Later, with no 🎯 links. Goal: Note Conventions, the templates and the Roadmap's rules live in the code repo (the Roadmap's rules).

### Step 3: `vault-lint.sh` checks the notes it's named and reports merge conflicts
**Builds:** [[#^piece-5|Piece 5]]'s named notes and merge-conflict check in `vault-lint.sh`, and the "Linting changed notes" convention in AGENTS.md's "Before you finish"
**Setup first:** none
**Implementer checks:**
- With the `# Where It Stands` heading deleted from a note in `notes/features/` and left uncommitted, `sh scripts/vault-lint.sh` with no arguments reports nothing for that note and ends with the line saying only the whole-vault checks ran. Named as an argument, the note is reported with "no # Where It Stands section". Undo the edit.
- Naming `Roadmap` gives no per-note report for it.
- A line `<<<<<<< HEAD` added to a note is reported with its file and line as a merge conflict for Sarah to resolve in Obsidian. Remove the line.

**Sarah checks:** none

### Step 4: `story-range.sh` finds a story's start by date
**Builds:** [[#^piece-11|Piece 11]]'s date method, while the notes are still in `notes/`
**Setup first:** none
**Implementer checks:**
- `sh scripts/story-range.sh "Mobile Month View"`, whose note is in `archive/` with ✅ steps, proposes the same start it gave before the change, recorded first.

**Sarah checks:** none

### Step 5: `/tooling` holds a workflow change's Roadmap edits until it's committed
**Builds:** [[#^piece-12|Piece 12]]'s held Roadmap edits, and the "Roadmap edits from a workflow change" convention
**Setup first:** none
**Implementer checks:**
- Read as a session would: step 3 leaves an edit to existing Roadmap lines or sections out of the change, step 6's report lists it under "Roadmap edits to apply after the commit", and when Sarah asks for the commit, the session commits the code-repo change first, then makes those edits and runs `vault-lint.sh` naming the notes it changed. Story progress still updates the Roadmap right away. The new text puts the condition first, as the `writing-standard` skill asks.

**Sarah checks:** none

### Step 6: The vault moves into the notes repo
**Builds:** [[#^piece-1|Pieces 1]], [[#^piece-3|3]], [[#^piece-4|4]], [[#^piece-6|6]] and [[#^piece-10|10]], and the rest of [[#^piece-5|Pieces 5]], [[#^piece-7|7]], [[#^piece-8|8]], [[#^piece-9|9]], [[#^piece-11|11]] and [[#^piece-12|12]]: where the six scripts look, the notes repo's folder paths in the moved files, `story-range.sh`'s `git log` in the notes repo and `/tooling`'s searches. Also the "Note paths in instructions", "Agents that read notes" and "Committing notes" conventions
**Setup first:** Setup 4 (Obsidian opens the new folder)
**Implementer checks:**
- **Before the freeze:** with Sarah's OK, run `gh workflow disable dependency-updates.yml`.
- From the main checkout and from a scratch worktree (removed after), `vault-lint.sh`, `vault-orphans.sh`, `note-refs.sh "Meal Editing"` and `user-comments.sh "Grocery List Integration"` give the output recorded before the freeze, with paths now relative to the notes repo, `note-section.sh "Lifecycle"` prints its section, and `story-range.sh "Mobile Month View"` proposes the start Step 4 found.
- With the notes folder renamed for a moment, `notes-dir.sh`, `vault-lint.sh` and the hook (run with sample JSON input) each stop with the error naming the path it looked for.
- The hook, run with sample input, lets through a note, a `.scratch/` file and a `docs/` file with the `docs` argument, and blocks a `src/` file with a message naming the notes repo. Run with `$CLAUDE_PROJECT_DIR` at the main checkout and `cwd` in a scratch worktree, it lets through that worktree's `.scratch/` and `docs/` files.
- The `design-files` server in `.claude/launch.json` starts and serves a file from the notes repo's `assets/`.
- A grep of `.claude/`, AGENTS.md, `docs/` and `scripts/` for `notes/` finds only paths inside the notes repo, written from its root.

**Sarah checks:**
- [ ] Open the vault in Obsidian from `~/repos/meal-planning-notes`. See the same settings, plugins and layout as before, and the Roadmap's status embeds rendering. Goal: Obsidian opens the vault from `~/repos/meal-planning-notes` with the settings and plugins it has today.
- [ ] Run `ls ~/repos/meal-planning-notes`. See `Roadmap.md`, `features`, `goals`, `archive` and `assets`, the three `.dc.html` files and `support.js`, which sit at the vault's top level today, and no `templates` folder or `Note Conventions.md`. Goal: the notes repo holds only notes and their files.
- [ ] Run `git -C ~/repos/meal-planning-notes log --oneline -- Roadmap.md | tail -3` and `git -C ~/repos/meal-planning-notes blame Roadmap.md | head`. See commits and dates from before the move. Goal: `git blame` and `git log` on a note show its history from before the move.
- [ ] Start a new Code-tab session in a worktree (the app's worktree option), accepting a trust dialog if one appears. Ask: "Create a note `Vault Check.md` in `features/tooling/` in the notes repo with one line, then run `sh scripts/vault-lint.sh` naming it." See no prompt for access to `~/repos/meal-planning-notes` (approving the edit itself is fine), the note appear in Obsidian, and the lint report "no ^status line under Where It Stands" for it. Then run `ls ~/repos/meal-planning` and see no `notes` folder. Delete `Vault Check` in Obsidian. Goals: every local session, worktree sessions included, edits notes with no prompt; there's one copy of every note, outside the code repo's checkouts.

### Step 7: Routines push their note changes to the notes repo
**Builds:** [[#^piece-13|Pieces 13]] and [[#^piece-14|14]], and the "Routines that change notes" convention
**Setup first:** Setup 3 (the `dependency-updates` routine gets the notes repo)
**Implementer checks:**
- Against two local clones of a scratch bare repo, never the real notes repo: a push the other clone got in first is rejected, and the session's steps pull and push again; a rebase whose changes can stand together, such as a renumbered list, is resolved and pushed; a rebase where both sides change the same content stops with nothing pushed.
- Read as a session would: a run whose only changes are notes leaves no commit on the branch, so it takes the skill's path that skips the push and the PR.
- **Before the check:** with Sarah's OK, commit and push the step to `develop`, and turn the workflow back on with `gh workflow enable dependency-updates.yml`. If a dependency PR is open, ask Sarah to merge or close it. Then delete the `dependency-alerts-reported-*` cache entries with `gh cache delete`, start the weekly run with `gh workflow run dependency-updates.yml -f mode=weekly`, and give Sarah the run's link and, once it starts, the session's.

**Sarah checks:**
- [ ] Open the session link `/infra-build` gives you in chat. See it run `vault-lint.sh` naming the notes it changed, sweep notes or the Roadmap, then commit and push them to the notes repo's `main`. Open the commit link in its summary and see the commit in `meal-planning-notes` on github.com. If it opened or updated a PR, see no note changed in it. Goal: any note a routine's session adds or changes reaches the notes repo's `main`, never a code branch.

### Step 8: Obsidian Git syncs the vault
**Builds:** [[#^piece-2|Piece 2]] and [[#^piece-10|Piece 10]]'s sync line in `docs/project_structure.md`
**Setup first:** Setup 5 (the Obsidian Git plugin)
**Implementer checks:** none

**Sarah checks:**
- [ ] In Obsidian, create a note `Sync Check` at the vault's top level with one line, and stop typing. Within about five minutes, open the commits link `/infra-build` gives you in chat and see a `vault backup:` commit adding it on `main`. Goal: an edit Sarah makes in Obsidian reaches `main` without her committing it.
- [ ] On github.com, add a line to `Sync Check` and commit it to `main`. Within about five minutes, see the line in Obsidian without pulling. Goal: changes pushed to the notes repo's `main` show up in the local vault without pulling.
- [ ] Close Obsidian. In a Code-tab session, ask it to add a line to `Sync Check` in the notes repo. Open Obsidian, and within about five minutes see a `vault backup:` commit with that line on `main`. Then delete `Sync Check` in Obsidian. Goal: an edit reaches `main` without Sarah committing it (a session's edit made while Obsidian was closed).

# Conventions
- **Note paths in instructions:** a skill, agent or doc that names a note path writes it from the notes repo's root and names the repo, such as "`features/` in the notes repo", never `notes/…`. A script or hook that needs the folder on disk gets it from `sh scripts/notes-dir.sh`, never from a path of its own. Lands in the `writing-standard` skill's `instructions.md`; AGENTS.md's Project line says the script exists.
- **Agents that read notes:** when a skill sends an agent work that reads notes, it puts the notes repo's path in the agent's prompt, whatever tools the agent has. Lands in the `writing-standard` skill's `instructions.md`.
- **Committing notes:** a local session never commits or pushes the notes repo; Obsidian Git does. Lands in AGENTS.md's Project line.
- **Linting changed notes:** a session that changed notes runs `sh scripts/vault-lint.sh` naming each note it changed before it finishes, routines included. Lands in AGENTS.md, "Before you finish".
- **Routines that change notes:** the routine selects both repos. It pushes its note changes straight to the notes repo's `main`, pulling with rebase first and retrying if rejected. It resolves a rebase conflict whose changes can stand together, such as added lines or a list that needs renumbering, and stops without pushing if they say different things about the same content. It opens a PR only for code changes. Lands in the `routine-sessions` skill, Branches.
- **Roadmap edits from a workflow change:** when a workflow change also edits existing Roadmap lines or sections, such as renaming a section, those edits are made only once the change is committed to `develop` (after its PR merges, once [[Branching and Releases]] adds one). Story progress updates the Roadmap right away. Lands in `/tooling`, step 3 and its step 6 report.

# Setup Outside the Repo
1. **The GitHub repo:** a private, empty repo `meal-planning-notes` on Sarah's account, with no README, `.gitignore` or license, since the history is pushed into it. Recorded in `docs/project_structure.md`.
2. **The Claude GitHub App's access:** on GitHub, Settings → Applications → Claude → Configure, add `meal-planning-notes` to its repositories. Recorded in `docs/ci.md`, "The Claude GitHub App".
3. **The `dependency-updates` routine:** at https://claude.ai/code/routines → the routine → Edit, add `meal-planning-notes` under repositories, which the docs now place at **Advanced settings > General > Repository**. Check whether the form has a per-repo "Allow unrestricted branch pushes" toggle, which some guides mention and the docs don't; if it does, turn it on for the notes repo. Recorded in `.claude/skills/dependency-updates/routine.md`.
4. **Obsidian:** open `~/repos/meal-planning-notes` as a vault ("Open folder as vault"), and remove the old `notes/` vault from the vault list. Recorded in AGENTS.md's Project line.
5. **The Obsidian Git plugin:** installed from Community plugins, with Piece 2's settings. Recorded in `docs/project_structure.md`'s Notes entry.

No secrets: the plugin pushes with the git credentials Sarah's Mac already uses for GitHub.

# Out of Scope
- Worktrees, protecting `develop` and the release process: [[Branching and Releases]].
