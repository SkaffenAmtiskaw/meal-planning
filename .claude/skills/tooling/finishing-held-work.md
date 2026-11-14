# Finishing a Merged PR's Held Notes Work
A PR labelled `notes-pending` merged before its session did the held notes work, so this session does it. It edits only notes, so it runs in the main checkout, with no worktree. The steps, in order:

1. **Check the PR:** run `gh pr view <number> --json state,labels,body`. What to do depends on what it shows:
   - **`state` isn't `MERGED`:** tell the user the PR's state, and that the held notes work waits for a merge, then stop.
   - **It has no `notes-pending` label:** tell the user its held notes work is already done, and stop.
   - **Otherwise:** go on.
2. **Do the work:** do each piece the body's "Held until the merge" list names, deleting a note as the `deleting-a-note` skill describes.
3. **Take the label off:** run `gh pr edit <number> --remove-label notes-pending`, so the next session start's sweep removes the PR's worktree.
4. **Report:** list each piece and what you did with it, then stop.
