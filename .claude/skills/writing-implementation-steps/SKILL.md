---
name: writing-implementation-steps
description: The rules for writing a story's implementation steps and their checks. Use when drafting a story's implementation steps or checking a draft of them.
user-invocable: false
---

# Writing Implementation Steps
Each step builds one area of the work and ends in checks that show its progress. Before the next step is built, the user reviews the step's diff and checks what it changes in the running app.

## One Area per Step
A step holds every behavior and new piece one area of the work needs, however small each one is. An area is a part of the work the user checks as one, such as the form's save rules, the dish row or one column of a screen. Each step costs the user a build session and a diff review, so a step smaller than its area costs them more than it saves.
- **Size.** File count doesn't size a step: eighteen files serving one new context provider are one step, and six files making unrelated changes aren't. The cases with a rule of their own:
  - **If the story is a sweep:** each unrelated item is its own area, however small.
  - **If the story is a pattern:** places that migrate to one rule in the same way are one area.
  - **If a pattern's checklist has an Enforcement item:** the Docs item goes in the step that builds it, since both keep future code to the Convention. Otherwise, the Docs item is a step of its own.
- **Refactors.** A refactor, replacement or extraction in the approach goes in a step chosen by what builds on it:
  - **If only one step builds on it, and the refactor is small,** such as a moved file or a new options argument: it goes in that step, ahead of the code that uses it, since it adds little to that step's diff.
  - **Otherwise:** it goes in one step with the other refactors that serve the same area, such as all the refactors the dish state needs. The user then reviews related refactors in one diff. That step comes before the first step that builds on them, so the diff holds no new behavior and the user can check that existing flows still work.
- **The idea sentence.** A step opens with one sentence saying what its area does once the step is built, such as "Saving drops blank dish rows, refuses a dish that has content but no name, and closes the modal once the save succeeds." If the sentence covers two areas, it's two steps.
- **Files.** Each file the step creates or changes is listed with a reason tied to the step's area. A file whose reason doesn't serve that area belongs in another step. The list is the planner's best guess, which the build can change, as "What the Builder Decides" describes.

## Something to See in Every Step
- **Slices, not layers.** A step that builds one layer, such as the types or the hook, has nothing to see. The first step of new UI puts something on screen, even hardcoded or unstyled, and each later step makes fake parts real or gets another area working.
- **Order.** Each step's checks work with only the code built through that step. If one needs a later step, the steps are out of order or split wrong.
- **Scaffolding.** A temporary page or hardcoded value is fine if it shows progress, as long as a later step removes it.

## Existing Code
- **Existing flows.** The existing flows that use code a step refactors should look and work exactly as before, and `checks.md` says who checks them.
- **No second job.** If a step adds behavior to an existing module, check that it's the job the module already does. If it's a different job, it needs a piece of its own, as Single Concern in `docs/project_conventions.md` requires.

## What the Builder Decides
A step says what to build and any choice that changes what the app or the tooling does. How the code inside it is organised, such as its helper functions, their names and which file each sits in, is left to whoever builds the step. Those are low-level details, and a plan that fixes them holds the builder to guesses made before the code existed.

## Checks
Write each step's checks as `checks.md` in this skill's folder describes.

## Coverage
Everything in the approach lands in a step. A step builds only what the approach holds, plus the E2E tests the story needs. It can also build anything its Source labels as an item the user pulled in or a Boy Scout fix.

The E2E tests a story needs are the ones the "What Gets E2E Tests" section of `docs/e2e_tests.md` asks for, even when the note doesn't list them. Read only that section: find its heading with Grep, then Read from there to the next `# ` heading. The rest of the doc is for writing and running the tests. A failure's E2E test is among them only if the approach marks the failure "(E2E test)", because whether a failure gets one is the user's call for each story. A test the note doesn't list has the Source "E2E test: <the flow>".

The approach can miss things, so the steps' Source lines also claim every part of the note that says what the story must build, fix or keep working, such as Requirements bullets, Design Handoff sections (by heading) or a `> [!warning]` callout another story routed in.

## Format
```
## Step N: <short title>
**Idea:** <one sentence, about one area>

**Source:** <the parts of the note it builds or fixes, e.g. "Handoff: Day cell states", "Requirement 3" or "Item: forbidden @tabler/icons-react mocks">

**Approach:** <how, citing the approach's pieces, e.g. "Piece 9a">

**Files:**
- `path/to/file.tsx` (new) - reason
- `path/to/other.ts` - reason

**Acceptance:**
- [ ] Go to ..., press ..., see .... Proves: ...
```

An item the user pulled in has the Source "Pulled in by <their name> YYYY-MM-DD: <the item>", plus "<their name> decided: <answer>" if they decided something for it.
