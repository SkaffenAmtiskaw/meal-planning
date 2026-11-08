# Fixing a Cause in the Repo
Follow this when the failed deployment's cause is code or config in the repo. You fix it on a `claude/` branch, open a pull request into the deployment's branch, and wait for the fix's own deployment.

Vercel posts a commit status on GitHub, with the context `Vercel`, that shows whether a commit deployed. Read it with:

```bash
gh api "repos/{owner}/{repo}/commits/<SHA>/status" --jq '.statuses[] | select(.context == "Vercel") | "\(.state) \(.target_url)"'
```

Its `target_url` is that deployment's inspector URL.

The steps, in order:
1. **Check the branch hasn't moved on.** If the branch's latest commit is a different one and its `Vercel` commit status is `success`, a newer commit has already fixed the failure. Open no pull request. Go to the summary in step 4 of `SKILL.md`, and give it a short verdict that names both commits and the newer one's inspector URL.
2. **Cut the fix branch** from the branch's latest commit:

   ```bash
   git checkout -b "claude/vercel-fix-<deployment ID>" "origin/<branch>"
   ```

   If that's a different commit from the failed one, run `pnpm install --frozen-lockfile` again.
3. **Reproduce the failure** with the build the repo sets up for Vercel: `buildCommand` in `vercel.json` if the file sets one, and `pnpm build` otherwise. If the log shows Vercel building with a different Node or pnpm version from `mise.toml`'s, use Vercel's where you can. If the failure doesn't reproduce here, such as when it depends on Vercel's build image, fix it from the log alone.
4. **Fix it.** Follow steps 3 to 5 of `.claude/skills/routine-sessions/fixing-a-failure.md`. In them, the scripts are the build you reproduced the failure with, and the head branch is the deployment's branch, `main` for production. The pull request's title is `Fix the Vercel <environment> deployment of <branch>`, and its body links the failed deployment's inspector URL. That file stops with a summary in two places. Where to go instead:
   - **If you couldn't fix it:** go to the summary.
   - **If you opened a pull request:** go on to step 5.
5. **Wait for the fix's deployment.** Vercel deploys the fix branch as a preview. Run this loop as one command with a 10-minute timeout, the longest a command can run. Run it at most three times, about 30 minutes in all:

   ```bash
   for i in $(seq 9); do
     state=$(gh api "repos/{owner}/{repo}/commits/<fix SHA>/status" --jq '[.statuses[] | select(.context == "Vercel") | .state][0] // "none"')
     echo "$state"
     case "$state" in success|failure|error) break ;; esac
     sleep 60
   done
   ```

   Then go to the summary, with the state the loop last printed.
