# Starting on a Branch
A story's code is built and reviewed only on its own branch, when the release freeze allows it, and on top of its base's latest work. These are the checks a skill runs before it builds or reviews, in order:

1. **The main checkout:** run `git rev-parse --path-format=absolute --git-dir --git-common-dir`. If the two paths are the same, this is the main checkout. Stop, and tell the user to start a Code-tab session with the worktree option and run the skill there.
2. **A hotfix's branch:** if the story's line on `Roadmap.md` in the notes repo has `🔥 Hotfix:`, run `git fetch origin`, then check both:
   - `git branch --show-current` starts with `hotfix/`.
   - `git rev-list --count origin/main..origin/develop` and `git rev-list --count origin/main..origin/develop ^HEAD` print the same number, which means the branch holds no commit from `develop` that isn't on `main`.

   If either fails, read `moving-to-a-hotfix-worktree.md` in this folder, follow it and stop. A hotfix ships to `main` on its own, so a branch cut from `develop` would carry `develop`'s unreleased work into `main`, whatever its name.
3. **The release freeze:** run `sh scripts/release-freeze.sh "<note name>"`. If it exits non-zero, stop, and tell the user what it printed.
4. **Uncommitted changes:** if `git status --untracked-files=no` shows any, stop, and ask the user to commit them or set them aside, because the base merge would mix them into its merge commit.
5. **The base merge:** the base is `main` on a `hotfix/` branch and `develop` on any other. Merging it in at the start of every session keeps each merge small, and it's how an open branch picks up a hotfix. How you merge depends on the session:
   - **If the base is `develop` and the session has the Claude desktop app's `sync_with_base_branch` tool:** bring the branch up to date with it, choosing a merge, not a rebase. The tool merges the branch the app cut the worktree from, and a hotfix worktree is made from `main` with git rather than by the app, so it isn't used there.
   - **Otherwise:** run `git fetch origin`, then `git merge --no-edit origin/<base>`.

   Then the cases, by how the merge went. Committing the merge without being asked is an exception to AGENTS.md's "commit only when they ask", because it holds only work already reviewed on the base:
   - **If it was clean:** if the merge isn't committed yet, commit it with `git commit --no-edit`.
   - **If it conflicts:** resolve the conflict with the user. Once they approve the resolution, commit the merge, then carry on with the skill.
