# Opening the PR
A story's code reaches its base in one PR, opened by the skill that finishes the story. The steps, in order:

1. **Commit:** run `git status`, which lists untracked files too, since a file that was never committed doesn't reach the PR. If anything that's part of the story is still uncommitted, such as a fix or a new file from an earlier step, show the user the files and ask whether to commit them. Once they say yes, commit them by path.
2. **Push:** run `git push -u origin HEAD`.
3. **Open the PR** into the branch's base, `main` on a `hotfix/` branch and `develop` on any other:

   ```sh
   gh pr create --base <base> --title "<note name>" --body "<what the story sets out to do, in a sentence, such as from its Purpose or a bug's Symptoms>"
   ```
4. **Auto-merge,** by the base:
   - **`develop`:** turn it on with `gh pr merge <number> --auto --squash`, so GitHub squashes the PR into `develop` once its required checks pass.
   - **`main`:** leave it off, because merging into `main` deploys, and every deploy is the user's click.
