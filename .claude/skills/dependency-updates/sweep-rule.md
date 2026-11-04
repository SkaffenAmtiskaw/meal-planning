# The Sweep Rule
A small major goes on a sweep for the next release, and anything bigger gets its own Roadmap line. A major is reported as new only once, so this keeps each one from being forgotten. Step 8 of the skill says what to keep from each major for the summary.

If a major ends in a Roadmap line and its sweep already has an unchecked item for the package, leave that item as it is, since the version it names can still be installed.

Take each major through these steps, in order:

1. **Rule out what's never an item.** The cases, and what to do with each before going on to the next major:
   - **A security major:** write its Roadmap line, since a sweep holds work that can wait for a goal, and a security fix shouldn't.
   - **A major of an assessed library's `@types/*` package,** with `@types/react-dom` counting as React's: nothing more, since it's part of that library's upgrade.
2. **Find its sweep.** A package in `dependencies` goes to Library Upgrades (`notes/features/tech debt/Library Upgrades.md`), and one in `devDependencies` goes to Dev Tool Upgrades (`notes/features/tooling/Dev Tool Upgrades.md`). An `@types/*` package follows its library. The cases, in the order to check them:
   - **If the note isn't at that path:** search all of `notes/` for a `type: sweep` note with `status: idea` and no date in its name, whose Purpose says the `dependency-updates` routine adds its items and names the package's section of `package.json`.
     - **If that finds it:** use it.
     - **If it finds nothing:** go on with no sweep, and "Write the item" writes a line instead. Don't create the note, since a missing one may mean Sarah stopped it collecting.
   - **If the package's item is in a kicked-off copy** (`<sweep> YYYY-MM-DD`): write no item and leave the copy alone, since a copy's items are a fixed set, so that it can be finished. Go on to the next major.
3. **Read its breaking changes,** from its GitHub releases, changelog or migration guide. Where to read them, and what to do if you can't:
   - **Where to read:** read `github.com` pages through WebFetch, since `gh` and `curl` reach only this repo from this session. Read `raw.githubusercontent.com` through WebFetch or `curl`. A `CHANGELOG.md` can be a symlink that returns only its target's path, so fetch that path.
   - **If a release only links to a guide on a site you can't reach:** look for the guide's source on GitHub, in the package's repo and then in its GitHub org's docs or website repo.
   - **If you still can't read them:** write its Roadmap line, and go on to the next major.
4. **Judge its size.** Search the code for each breaking change, to see whether the app hits it and in how many files. A sweep holds only small work with nothing to decide. If the work isn't small, or needs a decision, write its Roadmap line and go on to the next major.
5. **Write the item.** The cases, in the order to check them:
   - **If "Find its sweep" found none:** write a line in Later in `notes/Roadmap.md`, holding what the item would have said. Place it as "The Roadmap Line" describes.
   - **If the sweep already has an unchecked item for the package:** update that item's version, link, work and date.
   - **Otherwise:** add an item, as the sweep's What Belongs Here says.

## The Roadmap Line
A flagged package, meaning one that step 1, 3 or 4 writes a Roadmap line for, gets one plain line in Later in `notes/Roadmap.md`, so something on the Roadmap pulls it into a release. It follows this shape, with why it's flagged in the middle:

``- `typescript` 5.9.3 → 7.0.2: needs a decision on the compiler options in `tsconfig.json`. [Release notes](https://github.com/microsoft/TypeScript/releases). Found by the dependency-updates routine, 2026-11-03.``

Where it goes, in the order to check:
- **If a line for the package is already on the Roadmap,** wherever it sits: update that line.
- **If it's a security major:** under `Bugs` if the app's `dependencies` use the package, and otherwise under `[[Dev Tooling]]`. To tell, look at the first package in each of its audit `paths` (step 3 of the skill, "Security fixes"): the app uses it if any of those is in `dependencies`.
- **If the package is in `dependencies`:** at the end of the `[[App Health]]` heading.
- **If it's in `devDependencies`:** at the end of the `[[Dev Tooling]]` heading.

## Commit the Items and Lines
Once every major has been through the rule, if it changed a note, run `sh scripts/vault-lint.sh` and fix what it reports in the notes you changed. Then commit them.
