---
name: writing-implementation-steps
description: The rules for writing a story's implementation steps and their checks. Use when drafting a story's implementation steps or checking a draft of them.
user-invocable: false
---

# Writing Implementation Steps
Each step carries one idea and ends in checks that show progress the user can see, because the user reviews each step's diff and checks it in the running app before the next one is built.

## One Idea per Step
- **The idea sentence.** A step opens with one sentence saying what it does. If it needs "and", or "and" in disguise such as "with" or "plus", it's two steps.
- **Size.** Steps are sized by idea, not file count: eighteen files serving one new context provider are one step, and six files making unrelated changes aren't. In a sweep, unrelated items get separate steps, however small. In a pattern, places that migrate to one rule in the same way can share a step, since they're one idea.
- **A pattern's Docs item.** If the checklist has an Enforcement item, the Docs item goes in the step that builds it, since both keep future code to the Convention. Otherwise, it's a step of its own.
- **Files.** Each file the step creates or changes is listed with a reason tied to the idea. A file whose reason doesn't serve the idea belongs in another step. The list is the planner's best guess, which the build can change, as "What the Builder Decides" describes.

## Something to See in Every Step
- **Slices, not layers.** A step that builds one layer, such as the types or the hook, has nothing to see. The first step of new UI puts something on screen, even hardcoded or unstyled, and each later step makes one fake part real or adds one behavior.
- **Order.** Each step's checks work with only the code built through that step. If one needs a later step, the steps are out of order or split wrong.
- **Scaffolding.** A temporary page or hardcoded value is fine if it shows progress, as long as a later step removes it.

## Existing Code
- **Refactors.** Each refactor, replacement or extraction in the approach gets its own step, before the step that builds on it. Its checks are click-throughs of the existing flows that use the changed code, which should look and work exactly as before.
- **No second job.** If a step adds behavior to an existing module, check that it's the job the module already does. If it's a different job, it needs a piece of its own, as Single Concern in `docs/project_conventions.md` requires.

## What the Builder Decides
A step says what to build and any choice that changes what the app or the tooling does. How the code inside it is organised, such as its helper functions, their names and which file each sits in, is left to whoever builds the step. Those are low-level details, and a plan that fixes them holds the builder to guesses made before the code existed.

## Checks
Write each step's checks as `checks.md` in this skill's folder describes.

## Coverage
Everything in the approach lands in a step. A step builds only what the approach holds, plus the E2E tests the story needs. It can also build anything its Source labels as an item the user pulled in or a Boy Scout fix.

The E2E tests a story needs are the ones `docs/e2e_coverage.md` asks for, even when the note doesn't list them. A failure's E2E test is among them only if the approach marks the failure "(E2E test)", because whether a failure gets one is the user's call for each story. A test the note doesn't list has the Source "E2E test: <the flow>".

The approach can miss things, so the steps' Source lines also claim every part of the note that says what the story must build, fix or keep working, such as Requirements bullets, Design Handoff sections (by heading) or a `> [!warning]` callout another story routed in.

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
