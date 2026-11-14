# Opening the PR
A change reaches its base in one PR, opened by the skill that finishes it. The steps, in order:

1. **Commit:** run `git status`, which lists untracked files too, since a file that was never committed doesn't reach the PR. Everything it lists belongs to this branch, because a worktree holds only its own branch's work. If it lists anything, show the user the files and ask whether to commit them. Once they say yes, commit them by path.
2. **Merge the base:** merge the latest base into the branch, as checks 4 and 5 in `starting-on-a-branch.md` in this folder describe. Other PRs may have merged into the base since the branch last took it in. `develop`'s ruleset won't merge a PR that's behind it, and auto-merge doesn't bring a branch up to date, so a PR opened behind would wait for good.
3. **Push:** run `git push -u origin HEAD`.
4. **Open the PR** into the branch's base, `main` on a `hotfix/` branch and `develop` on any other. Title it by what it is: a story by its note's name, and any other change by the change in a few words.

   Notes work that waits on the merge, such as a Roadmap edit, is held notes work. If there is any, the PR has to carry it, because the session may end before the merge. Add each piece to the body as a bullet under a "Held until the merge" heading, and add `--label notes-pending`. Keep both exact, since the sweep finds the PR by the label and `/tooling #<PR>` reads the list by its heading.

   ```sh
   gh pr create --base <base> --title "<title>" --body "<what the change sets out to do, in a sentence, such as from the note's Purpose or a bug's Symptoms>" [--label notes-pending]
   ```
5. **Auto-merge,** by the base:
   - **`develop`:** turn it on with `gh pr merge <number> --auto --squash`, so GitHub squashes the PR into `develop` once its required checks pass.
   - **`main`:** leave it off, because merging into `main` deploys, and every deploy is the user's click.
