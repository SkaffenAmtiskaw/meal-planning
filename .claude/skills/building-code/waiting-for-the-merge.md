# Waiting for the Merge
The session that opened a PR with held notes work waits for the merge and does that work itself, because it has the context and the user's approval. The steps, in order:

1. Run `gh pr checks <number> --watch` in the background.
2. What to do depends on how the checks went:
   - **A check failed:** tell the user which one, and that once a fix merges, the next session start offers `/tooling #<number>` to do the held notes work.
   - **They passed:** run `gh pr view <number> --json state,mergeStateStatus`, and go by what it shows:
     - **`state` is `MERGED`:** do the held notes work. Then take the label off with `gh pr edit <number> --remove-label notes-pending`, so the sweep removes the worktree.
     - **`mergeStateStatus` is `BEHIND`:** `develop` moved since the checks ran, and the PR can't merge until it's up to date. Run `gh pr update-branch <number>`, then go back to step 1.
     - **`mergeStateStatus` is `DIRTY` or `BLOCKED`:** auto-merge can't merge it, such as when it conflicts with `develop`. Tell the user why, and that the held notes work waits for the merge, as for a failed check.
     - **Otherwise:** auto-merge hasn't merged it yet, so check again in a minute.
