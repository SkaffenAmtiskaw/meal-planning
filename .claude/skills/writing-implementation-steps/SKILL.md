---
name: writing-implementation-steps
description: The rules for writing a story's implementation steps and their checks. Use when drafting a story's implementation steps or checking a draft of them.
user-invocable: false
---

# Writing Implementation Steps
Each step carries one idea and ends in checks that show progress the user can see, because the user reviews each step's diff and checks it in the running app before the next one is built.

## One Idea per Step
- **The idea sentence.** A step opens with one sentence saying what it does. If it needs "and", or "and" in disguise such as "with" or "plus", it's two steps.
- **Size.** Steps are sized by idea, not file count: eighteen files serving one new context provider are one step, and six files making unrelated changes aren't. In a sweep or roundup, unrelated items get separate steps, however small.
- **Files.** Each file the step creates or changes is listed with a reason tied to the idea. A file whose reason doesn't serve the idea belongs in another step.

## Something to See in Every Step
- **Slices, not layers.** A step that builds one layer, such as the types or the hook, has nothing to see. The first step of new UI puts something on screen, even hardcoded or unstyled, and each later step makes one fake part real or adds one behavior.
- **Order.** Each step's checks work with only the code built through that step. If one needs a later step, the steps are out of order or split wrong.
- **Scaffolding.** A temporary page or hardcoded value is fine if it shows progress, as long as a later step removes it.

## Existing Code
- **Refactors.** Each refactor, replacement or extraction in the approach gets its own step, before the step that builds on it. Its checks are click-throughs of the existing flows that use the changed code, which should look and work exactly as before.
- **No second job.** If a step adds behavior to an existing module, check that it's the job the module already does. If it's a different job, it needs a piece of its own, as Single Concern in `docs/project_conventions.md` requires.

## Checks
Which kind of check a step gets depends on what it changes:
- **If it changes only test files:** break-it checks, plus at least one run-and-see check if any of the files are E2E code, as `docs/e2e_tests.md` lists under "Where E2E Code Lives". Write them as `test-only-checks.md` in this skill's folder describes.
- **Otherwise:** click-throughs in the running app, "Go to [view], [do something], see [result]", naming the screen size (phone or desktop), the data needed, such as a day with two meals, and any signed-in user, as "Which User to Sign In As" in the `running-the-app` skill describes.

A step whose Source names a Symptom checks it by following the Symptom's repro steps, which should no longer show the bug. A step that builds a failure, empty or read-only behavior checks that behavior too.

Each check:
- **Proves what the step built.** "Tests pass" and "types compile" aren't checks, since they hold for every step, and neither is a library's default behavior, such as a Mantine Popover flipping above its trigger, which the user trusts without checking.
- **Ends with "Proves: <what it shows>",** so the user knows what it will teach them before spending time on it.
- **Is usable as written.** It spells out the command the user runs, the text they paste or the screen they open, or, if that's only known at build time, such as a token, says the implementer gives it to them in chat. It never sends them elsewhere in the note, such as to "Step 1's token".

### The User's Checks and the Implementer's
Each check costs the user time, so the user's checks stay within the limits below, and anything else the step needs verified goes in its Approach, for the implementer:
- **A case or two per rule.** A block of cases sharing one mechanism, such as the bans in one Biome override, fails together, so one case proves the block.
- **The finished step only.** The user never checks the old behavior first. If a check compares against the state before the change, such as a test count, the implementer records that state before changing anything. Break-it checks are fine, since they're edits to the finished step.
- **Nothing already shown.** If an earlier check, or a run the implementer can do on its own machine, already proves something, there's no check for it. For example, there's no need to break a secret on GitHub to see a job fail when the implementer can run the job's script against a local server that returns 401.

## Coverage
Everything in the approach lands in a step. A step builds only what the approach holds, plus anything its Source labels an item the user pulled in or a Boy Scout fix.

The approach can miss things, so the steps' Source lines also claim every part of the note that says what the story must build, fix or keep working, such as Requirements bullets, Design Handoff sections (by heading), Symptoms, Acceptance Criteria, or a `> [!warning]` callout another story routed in.

## Format
```
## Step N: <short title>
**Idea:** <one sentence, no "and">

**Source:** <the parts of the note it builds or fixes, e.g. "Handoff: Day cell states", "Requirement 3" or "Item: forbidden @tabler/icons-react mocks">

**Approach:** <how, citing the approach's pieces, e.g. "Piece 9a">

**Files:**
- `path/to/file.tsx` (new) - reason
- `path/to/other.ts` - reason

**Acceptance:**
- [ ] Go to ..., press ..., see .... Proves: ...
```

An item the user pulled in has the Source "Pulled in by <their name> YYYY-MM-DD: <the item>", plus "<their name> decided: <answer>" if they decided something for it.
