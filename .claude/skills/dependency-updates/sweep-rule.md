# The Sweep Rule
A small update the session can't apply goes on a sweep for the next release, and anything bigger gets its own Roadmap line. An update is reported as new only once, so this keeps each one from being forgotten.

Each change below is given exactly, so this routine doesn't need the `editing-notes` skill.

A **security update** is a security major, a dropped fix for an advisory or an advisory no fix cleared.

## The Roadmap Line
A package that the steps below write a Roadmap line for is a flagged package. Its line is one plain line in `Roadmap.md` in the notes repo, so something on the Roadmap pulls it into a release. It follows this shape, and a security update's line also ends with `🚨 <advisory ID>, <severity>`:

``- `<package>` <old> → <new>: <why it's flagged>. [Release notes](<link>). Found by the dependency-updates routine, <date>.``

`<why it's flagged>` is one of these:
- a security update, with its advisory ID and severity, as an upgrade to plan on its own. For a dropped fix, also give each error or failure and its file count. For an advisory no fix cleared, also say what you tried.
- a possible story, since you couldn't read its breaking changes. Name the site you couldn't reach and where on GitHub you looked, so the user can tell what's been tried.
- why it looks like a story of its own, with each breaking change, error or failure and its file count

Name a file in the line only if a check's output names it or you've seen that it uses the package, since the user plans the upgrade from what the line says.

Where it goes, in the order to check:
- **If it's a security update:** as the first line of Next below any 🔥 lines, so it's the next work after any hotfix unless the user moves it. Renumber the rest of Next, so its numbers run in order. If the package already has a line in Next with 🚨, update that line where it is. If it has a line anywhere else on the Roadmap, this line replaces it.
- **If a line for the package is already on the Roadmap,** wherever it sits: update that line.
- **If the package is in `dependencies`:** at the end of the `[[App Health]]` heading in Later.
- **If it's in `devDependencies`:** at the end of the `[[Dev Tooling]]` heading in Later.

If the package's sweep already has an unchecked item for it, leave that item as it is, since the version it names can still be installed.

## The Steps
Take each update through these steps, in order:

1. **Rule out what's never an item.** The cases, and what to do with each before going on to the next update:
   - **A security update:** write its Roadmap line, since a sweep holds work that can wait for a release, and a security update shouldn't.
   - **A major of an assessed library's `@types/*` package:** nothing more, since it's part of that library's upgrade.
2. **Find its sweep.** The sweep depends on a section of `package.json`. For an `@types/*` package whose library is in that file, it's the library's section. For any other package, it's the package's own. `dependencies` goes to Library Upgrades (`features/tech debt/Library Upgrades.md` in the notes repo), and `devDependencies` goes to Dev Tool Upgrades (`features/tooling/Dev Tool Upgrades.md` in the notes repo). The cases, in the order to check them:
   - **If the note isn't at that path:** go on with no sweep, and "Write the item" writes a line instead. Don't create the note, since the user may have removed it so it stops collecting items.
   - **If the package's item is in a kicked-off copy** (`<sweep> YYYY-MM-DD`): write no item and leave the copy alone. A copy's items are a fixed set, so that the copy can be finished. Go on to the next update.
3. **Read the work.** For a dropped update, the work is each error or failure you kept when you dropped the update, each with its file. For a major, the work is its breaking changes, from the first release of its new major, its changelog or its migration guide. "Reading release notes" in step 4 of the skill says how to read the first two. What to do if you can't read the breaking changes in any of the three:
   - **If a release only links to a guide on a site you can't reach:** look for the guide's source on GitHub, in the package's repo and then in its GitHub org's docs or website repo. For example, `preactjs.com/guide/v11/upgrade-guide` is `content/en/guide/v11/upgrade-guide.md` in `preactjs/preact-www`.
   - **If you still can't read them:** write its Roadmap line, and go on to the next update.
4. **Judge its size.** For a major, search the code for each breaking change, to see whether the app hits it and in how many files. A sweep holds only small work with nothing to decide. If the work isn't small, or needs a decision, write its Roadmap line and go on to the next update.
5. **Write the item.** The cases, in the order to check them:
   - **If "Find its sweep" found none:** write a line in the notes repo's `Roadmap.md`, holding what the item would have said. Place it as "The Roadmap Line" describes.
   - **If the sweep already has an unchecked item for the package:** update that item's version, link, work and date.
   - **Otherwise:** add an item, as the sweep's What Belongs Here says.

## Push the Items and Lines
Once every update has been through the rule, check whether any note changed. If one did, run `sh scripts/vault-lint.sh "<note>" …`, naming each one, and fix what it reports in those notes. Then commit them in the notes repo and push to its `main`, as "Branches" in the `routine-sessions` skill describes. Once the push goes through, keep the hash of that commit on `main` (`git -C "<notes path>" rev-parse HEAD`) for the summary.

If a rebase conflict keeps them from being pushed, keep what each item and line says and where it goes, for the summary's **Not applied**.
