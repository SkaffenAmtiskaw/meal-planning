# The Sweep Rule
A small update the session can't apply goes on a sweep for the next release, and anything bigger gets its own Roadmap line. The rule takes two kinds of update: a major of a package other than the assessed libraries, and an update that step 3 or 7 of the skill dropped because it broke a check, whatever its package. An update is reported as new only once, so this keeps each one from being forgotten.

If step 2 of the skill aborted the merge of `develop`, this run pushes nothing, so an item or line wouldn't reach the pull request. Change no note, and keep what each item and line would have said for the summary's **Not applied**.

A **security fix** is a security major or a dropped fix for an advisory.

Take each update through these steps, in order:

1. **Rule out what's never an item.** The cases, and what to do with each before going on to the next update:
   - **A security fix:** write its Roadmap line, since a sweep holds work that can wait for a goal, and a security fix shouldn't.
   - **A major of an assessed library's `@types/*` package,** with `@types/react-dom` counting as React's: nothing more, since it's part of that library's upgrade.
2. **Find its sweep.** A package in `dependencies` goes to Library Upgrades (`notes/features/tech debt/Library Upgrades.md`), and one in `devDependencies` goes to Dev Tool Upgrades (`notes/features/tooling/Dev Tool Upgrades.md`). An `@types/*` package follows its library. The cases, in the order to check them:
   - **If the note isn't at that path:** search all of `notes/` for a `type: sweep` note with `status: idea` and no date in its name, whose Purpose says the `dependency-updates` routine adds its items and names the package's section of `package.json`.
     - **If that finds it:** use it.
     - **If it finds nothing:** go on with no sweep, and "Write the item" writes a line instead. Don't create the note, since a missing one may mean Sarah stopped it collecting.
   - **If the package's item is in a kicked-off copy** (`<sweep> YYYY-MM-DD`): write no item and leave the copy alone, since a copy's items are a fixed set, so that it can be finished. Go on to the next update.
3. **Read the work.** For a dropped update, the work is each finding or failure you kept when you dropped the update, each with its file. For a major, the work is its breaking changes, from the first release of its new major, its changelog or its migration guide. Where to read a major's breaking changes, and what to do if you can't:
   - **Where to read:** read `github.com` pages through WebFetch, since `gh` and `curl` reach only this repo there. Read `raw.githubusercontent.com` through WebFetch or `curl`. A `CHANGELOG.md` can be a symlink that returns only its target's path, so fetch that path.
   - **If the new major's first release isn't on the first page of releases:** a page shows only the newest releases, of every package in the repo, so go on to the next pages (`?page=2`). Or read the changelog, which in a repo of several packages sits in the package's folder, such as `packages/plugin-react/CHANGELOG.md`.
   - **If a release only links to a guide on a site you can't reach:** look for the guide's source on GitHub, in the package's repo and then in its GitHub org's docs or website repo. For example, `preactjs.com/guide/v11/upgrade-guide` is `content/en/guide/v11/upgrade-guide.md` in `preactjs/preact-www`.
   - **If you still can't read them:** write its Roadmap line, and go on to the next update.
4. **Judge its size.** For a major, search the code for each breaking change, to see whether the app hits it and in how many files. A sweep holds only small work with nothing to decide. If the work isn't small, or needs a decision, write its Roadmap line and go on to the next update.
5. **Write the item.** The cases, in the order to check them:
   - **If "Find its sweep" found none:** write a line in Later in `notes/Roadmap.md`, holding what the item would have said. Place it as "The Roadmap Line" describes.
   - **If the sweep already has an unchecked item for the package:** update that item's version, link, work and date.
   - **Otherwise:** add an item, as the sweep's What Belongs Here says.

## The Roadmap Line
A flagged package, meaning one that step 1, 3 or 4 writes a Roadmap line for, gets one plain line in Later in `notes/Roadmap.md`, so something on the Roadmap pulls it into a release. It follows this shape:

``- `<package>` <old> → <new>: <why it's flagged>. [Release notes](<link>). Found by the dependency-updates routine, <date>.``

`<why it's flagged>` is one of these:
- a security fix, with its advisory ID and severity, as an upgrade to plan on its own. For a dropped fix, also give each finding or failure and its file count.
- a possible story, since you couldn't read its breaking changes. Name the site you couldn't reach and where on GitHub you looked, so Sarah can tell what's been tried.
- why it looks like a story of its own, with each breaking change, finding or failure and its file count

Name a file in the line only if a check's output names it or you've seen that it uses the package, since Sarah plans the upgrade from what the line says.

Where it goes, in the order to check:
- **If a line for the package is already on the Roadmap,** wherever it sits: update that line.
- **If it's a security fix:** under `Bugs` if the app's `dependencies` use the package, and otherwise under `[[Dev Tooling]]`. To tell, look at the first package in each of its audit `paths` (step 3 of the skill, "Security fixes"): the app uses it if any of those is in `dependencies`.
- **If the package is in `dependencies`:** at the end of the `[[App Health]]` heading.
- **If it's in `devDependencies`:** at the end of the `[[Dev Tooling]]` heading.

If the package's sweep already has an unchecked item for it, leave that item as it is, since the version it names can still be installed.

## Commit the Items and Lines
Once every update has been through the rule, check whether any note changed. If one did, run `sh scripts/vault-lint.sh` and fix what it reports in those notes. Then commit them.
