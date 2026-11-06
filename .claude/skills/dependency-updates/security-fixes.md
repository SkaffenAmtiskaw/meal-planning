# Security Fixes
Follow this for each advisory. A reminder goes through the same steps as a new advisory, so it picks up any fix released since an earlier run reported it.

Run `pnpm audit --json`, and find each advisory in its `advisories` object by ID. A path in `findings` runs from `package.json` down to the package, as in `.>jsdom>undici`.

The advisories that need no fix from this session, in the order to check them:
- **The ID isn't in the audit:** it's already fixed, on `develop` or by an earlier update in the open pull request. Apply nothing, and list it as already fixed.
- **It's a reminder, and the notes repo's `Roadmap.md` has a line for its package:** apply nothing, and list it with that line. The line holds the work, and retrying each week would only repeat what the earlier run tried.
- **`patched_versions` is `<0.0.0`:** no fixed version has been released. Apply nothing, and list it as having no fix yet.
- **Its lowest fixed version is in a later major than the installed version:** its only fix is a major. A minor of a version below 1.0 counts as a major here, as in `0.3.2` → `0.4.0`. Apply nothing, and handle it with the majors in step 4 of the skill.

Fix the rest one package at a time, taking every advisory on that package together. The fixed version is the lowest version in every one of their `patched_versions`, such as `9.7.2` for `mongoose`'s `>=9.1.6` and `>=9.7.2`.

Use the first fix below that clears them all. After each try, run `pnpm audit --json` to check that their IDs are gone. If a try changed nothing in the audit, undo it (`git checkout -- package.json pnpm-lock.yaml pnpm-workspace.yaml`, then `pnpm install --frozen-lockfile`) before the next. The fixes, in order:
1. **The package is in `package.json`:** update it to the fixed version, with `pnpm update "<package>@<fixed version>"`.
2. **It isn't, so try a lockfile bump:** `pnpm update "<package>"`.
3. **A parent update:** if the package just before the vulnerable one in a path is in `package.json`, that's the parent. Find the parent's lowest version, in its current major, whose `dependencies` or `peerDependencies` range for the vulnerable package allows the fixed version. Update it with `pnpm update "<parent>@<version>"`. If no version in its major allows the fix, go to the next fix.
4. **An override:** for each advisory, add an entry under `overrides` in `pnpm-workspace.yaml`, kept to the installed major with a `^`, such as `'undici@>=7.0.0 <7.28.0': '^7.28.0'`. A bare `>=7.28.0` would let the next major in. Then run `pnpm install --no-frozen-lockfile`.

If none of them clears an advisory, such as when an override leaves a peer dependency at its old version in the lockfile, undo them all, and list it as not fixed, with what you tried. Never edit `pnpm-lock.yaml` by hand to clear it: removing a package's entries can leave a lockfile without the package, and the audit then shows it clean though nothing was fixed.
