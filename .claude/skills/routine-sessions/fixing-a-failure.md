# Fixing a Failed Job
Follow this when a job that failed on GitHub fails in this session too.

Whenever a step below runs the scripts, run them the way you reproduced the failure, such as with the same variable set. If you reproduced it by merging the base branch, run them on a throwaway merge in a detached checkout, then go back to the fix branch. The fix branch never holds that merge, because pushing it would put the base branch's commits into the pull request.

If the `root-cause-analyst` subagent diagnosed the failure, whether your skill or you called it, each summary you stop with below holds its report unedited and says the analyst wrote it, because the report is written for the user to review.

The steps, in order:

1. **Cut the fix branch,** named after the failed run, from the head branch's latest commit:

   ```bash
   git checkout -b "claude/ci-fix-<run ID>" "origin/<branch>"
   ```
2. **Check the latest commit.** If it's a different commit from the failed one, run `pnpm install --frozen-lockfile` and each script before you change anything. If every one passes, a newer commit has already fixed the failure. Open no pull request, and stop with a short verdict for the user, naming both commits and the scripts that failed on the first and pass on the second.
3. **Diagnose and fix** the cause. Fix only what makes the scripts fail, so the user can review the pull request as that one fix. Where the diagnosis comes from depends on the case:
   - **Your skill gave you one, or the scripts' output makes the cause plain:** fix from that.
   - **Otherwise,** such as when a test fails and nothing in the branch's changes explains it: hand the failure to the `root-cause-analyst` subagent, which runs on a stronger model, so the fix rests on a sound diagnosis, and the user can check the diagnosis against the fix. Give it the script, the script's output and the commits under suspicion. If the session has the notes repo, also give it the repo's path. Fix from its report.

   If you can't fix it, such as because the fix needs the user's decision or you can't find the cause, open no pull request. If you committed partial work, push the branch so they can look at it. Stop with a summary for the user: what you found, what you tried, the branch if you pushed one, and what you need from them.
4. **Commit the fix.**
5. **Run each script again.** What to do depends on the result:
   - **Every one passes:** push the branch, then open a pull request from it into the head branch, as `routine-sessions` describes, with the title your skill names. The body says the cause and the fix in a line or two, then gives your skill's links. Stop with a summary for the user: the cause, the fix, the pull request's link and anything they need to decide.
   - **Any still fails:** go back to step 3.
