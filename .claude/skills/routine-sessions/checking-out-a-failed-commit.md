# Checking Out a Failed Commit
Follow this when your skill has a branch and the commit that failed on it. The routine starts on `develop`, and its clone may hold no other branch, so fetch the branch, then check out the commit:

```bash
git fetch origin "+refs/heads/<branch>:refs/remotes/origin/<branch>"
git checkout --detach "<SHA>"
```

If the checkout fails because the commit isn't in the clone, such as after a force-push, run `git fetch origin "<SHA>"` and check it out again.

Then run `pnpm install --frozen-lockfile` and `pnpm lefthook install`.
