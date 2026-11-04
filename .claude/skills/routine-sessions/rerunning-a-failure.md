# Re-running a Failed Job
Follow this when a job failed on GitHub but its script passes in this session. Re-running the failed jobs on GitHub once tells a flake from a failure that happens only on GitHub's runner.

## 1. Check the Head Branch Hasn't Moved On
If the run isn't on a pull request, such as a scheduled run, skip this step, since a newer commit has no run of its own.

Otherwise, fetch the head branch and compare its latest commit with the failed commit:

```bash
git fetch origin "+refs/heads/<branch>:refs/remotes/origin/<branch>"
git rev-parse "origin/<branch>"
```

If it's a different commit, don't re-run, because the newer commit has its own run, and re-running the old one could cancel it. Find that run with `gh run list --commit "<latest SHA>" --workflow checks.yml --json url,status,conclusion`. Stop with a short verdict for the user. It says that the failed jobs' scripts passed in this session on the failed commit, and that the branch has moved on to the latest commit. It then gives the link and state of that commit's run, or says that commit has no run yet.

## 2. Re-run the Failed Jobs
Re-run at most once, whatever happens next:

```bash
gh run rerun "<run ID>" --failed
```

## 3. Wait for It
Check the run every minute until attempt 2 has finished. Run this loop as one command with a 10-minute timeout, the longest a command can run. Run it at most three times, about 30 minutes in all:

```bash
for i in $(seq 9); do
  state=$(gh run view "<run ID>" --json attempt,status,conclusion --jq '"\(.attempt) \(.status) \(.conclusion)"')
  echo "$state"
  case "$state" in "2 completed "*) break ;; esac
  sleep 60
done
```

If attempt 2 still hasn't finished after the third loop, stop and tell the user the re-run is still going, with its link (`<run URL>/attempts/2`).

## 4. Read the Result
List attempt 2's failed jobs. Judge only the jobs you're looking into, since a run can hold others:

```bash
gh run view "<run ID>" --attempt 2 --json jobs --jq '.jobs[] | select(.conclusion == "failure") | .name'
```

What to do depends on the result:
- **Attempt 2 was cancelled,** such as by a new push: stop with a short verdict that says so, with its link.
- **None of the jobs you're looking into failed:** the failure was a flake. Stop with a short verdict for the user: which jobs flaked, the failed run (`<run URL>/attempts/1`), the scripts that passed in this session on the failed commit, and the passing re-run (`<run URL>/attempts/2`).
- **Any of the jobs you're looking into failed:** the failure is real, but happens only on GitHub's runner. Go on to step 5.

## 5. Diagnose a Failure Only GitHub's Runner Has
Read the failed steps' logs from both attempts:

```bash
gh run view "<run ID>" --attempt 1 --log-failed
gh run view "<run ID>" --attempt 2 --log-failed
```

Look for what differs between this session and the runner, such as the tool versions the logs show or the variables the runner sets, like `GITHUB_ACTIONS`. On a pull request, the commit tested differs too: GitHub ran the checks on a merge of the failed commit into the base branch (`gh api "repos/{owner}/{repo}/pulls/<PR number>" --jq .base.ref`).

When you find a likely cause, reproduce it before you fix anything, because a fix you can't run against the failure is only a guess. Recreate that difference, such as by setting the variable, or by fetching the base branch and merging it in a detached checkout. Then run each failed job's script again. What to do depends on the result:
- **The failure shows up:** fix the failure, as your skill says.
- **You can't reproduce it:** open no pull request. Stop with a summary for the user: the failed run and the failing re-run with their links, what you found in their logs, what you tried, and what you need from them.
