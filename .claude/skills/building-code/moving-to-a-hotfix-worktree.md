# Moving to a Hotfix Worktree
How a session moves a 🔥 story's work into a `hotfix/` worktree cut from `main`, when check 2 in `starting-on-a-branch.md` fails. The session makes the worktree itself because the desktop app only cuts worktrees from `develop`. The steps, in order:

1. **The worktree:** `<slug>` is the note's name in lowercase, with hyphens for spaces. The cases, in the order to check them:
   - **If this session is on `hotfix/<slug>`:** stop, and tell the user the branch holds commits from `develop` that aren't on `main`. Only they can decide what happens to that work, and a new session there would fail the same check.
   - **If `git worktree list` shows a worktree on `hotfix/<slug>`:** use it.
   - **Otherwise:** make one in the main checkout's `.claude/worktrees/`, even if this session runs in another worktree:

     ```bash
     git worktree add -b hotfix/<slug> "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.claude/worktrees/hotfix-<slug>" origin/main
     ```
2. **The session:** start a session in the worktree with `start_session`, with `initiation` "user_asked", `context` "fresh", `cwd` set to the worktree's folder, `use_worktree` false and `prompt` the skill's command with the note's name, such as `/investigate <note name>`. It's "user_asked" because the user asked for this skill to run, so the new session starts rather than waiting on a card. If this session can't start one, give the user the worktree's folder and the command to run there.
3. **Stop,** and tell the user the story is a hotfix and the new session has it, with a link to the session.
