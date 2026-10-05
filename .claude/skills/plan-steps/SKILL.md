---
name: plan-steps
description: Break a note's approved approach into implementation steps that each carry one idea and end in checks Sarah can do in the running app. Writes the approved plan to the note's Implementation section.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Plan the implementation steps for the note **$ARGUMENTS**.

## Why this skill works the way it does
An agent builds each step. Sarah reviews the diff by hand and checks the step in the running app before the next one starts. The steps are how she makes sure the agent built what she expected, instead of letting it do whatever it wants.

Past plans failed her in two ways:
- **Steps too big.** One step made many unrelated changes, so she couldn't follow the diff.
- **Steps meaningless.** The check was "unit tests pass." `expect(true).toEqual(true)` passes too. Every step has to make progress she can see with her own eyes.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Read the note
Find the note in `notes/features/`. It needs `status: spec` and an approved approach:
- **Feature:** a `# Suggested Approach`.
- **Pattern:** Rules, Enforcement, and a Migration Checklist. Some older notes call the checklist "Places to Update."
- **Infra:** Goals and a Design, plus Conventions and Setup Outside the Repo if it has them.
- **Sweep:** its unchecked Items, minus any a ⚠️ Check Drift callout drops or moves out. A kicked-off sweep goes through `/check-drift` first. If its `^status` line still says "Kicked off. Next: /check-drift", tell Sarah and stop.
- **Roundup:** every question under Open Decisions decided, minus any a ⚠️ Check Drift callout drops. If one is still open, `/decide` comes first.
- **Bug:** a `# Fix` with the chosen fix, and the Root Cause behind it. If Fix points to an Open Decision, that decision needs a **Decided** line. Some older notes call the section "Fix Options"; use the option recorded as decided there.
- **Cleanup:** Current State, with every question under Open Decisions decided.

If the status or the approach is missing, tell Sarah what you found and stop. For a feature without an approach, `/assess` comes first. For a bug or cleanup, `/investigate` does. For infra, `/infra-design` does.

**Check for drift since `confirmed`.** List the commits dated after the note's `confirmed` date that touch `src/`, `test/` or `docs/`, with the files each one changed (`git log --since="<confirmed> 23:59:59" --name-only -- src test docs`), and any uncommitted changes there (`git status -- src test docs`). From the commit messages and the files, judge whether any of them could touch what the note builds: the code, UI areas and kinds of things its approach names.
- **None could:** tell Sarah in one line, e.g. "3 commits since 2026-09-25, all in the user settings screen. No drift check needed.", and go on.
- **Any could, or you can't tell:** tell Sarah which commits and why. Set the `^status` line to "Possible drift since <confirmed>. Next: /check-drift", give her the command to run in a new session, `/check-drift <note name>`, and stop.

Read any ⚠️ Check Drift callouts and **As built** notes as well.

If the note has a `# From the Split` section because the story was split from a larger plan, start from its draft steps rather than drafting from nothing. They aren't approved yet, so they go through the checkers and Sarah's review like any other draft.

If the note already has an Implementation section, this is a re-plan. Steps marked ✅ Complete stay exactly as they are. Plan only the remaining work, and in step 4 show what changed compared with the old steps.

## 2. Draft the steps

### One idea per step
- **The idea sentence.** Each step opens with one sentence saying what it does, with no "and." Watch for "and" in disguise: "with", "plus", "while also". If the sentence needs one, it's two steps.
- **Size.** Size steps by idea, not file count. Eighteen files that all serve one new context provider are one step. Six files making unrelated changes are not.
- **Files.** List every file the step expects to create or change, each with a short reason tied to the idea sentence. A file whose reason doesn't serve the idea belongs in a different step.

### Something to see in every step
- **Slice vertically.** Don't split by layer (types, then hook, then component). Layer steps have nothing to see. The first step of new UI puts something on screen in the right place, even if it's hardcoded or unstyled. Each later step replaces one fake part with the real thing or adds one behavior.
- **Order.** For every step, ask: can its checks be done in the running app using only the code through this step? If a check needs a later step, the step is out of order or split wrong. Never end with a "wire it all together" step.
- **Scaffolding.** A temporary page or hardcoded value is fine if it's how Sarah sees progress. Plan when it gets removed.
- **Setup outside the repo.** In an infra story, each piece of Setup Outside the Repo goes in the first step whose checks need it. The step's Approach gives the instructions Sarah follows to set it up, and `/implement` walks her through them before the first check that needs it.

### Refactors
- **Their own steps.** Every "refactor first", "replace" or "extract shared piece" decision in the approach gets its own step, before the step that builds on it.
- **Their checks.** A refactor step's checks list the existing flows that use the changed code, as click-throughs. Each says the flow should look and work exactly as before.

### Don't give an existing module a second job
When a step adds behavior to an existing module, name the job that module already does and confirm the new behavior is the same job. If it isn't, the behavior needs its own piece. If the approach doesn't already have one, ask Sarah before adding it.

### Checks
Each acceptance criterion is a checkbox. What kind of check it is depends on what the step changes:
- **Only test files:** break-it checks, as "Test-only steps" below describes. If any of the files are E2E code, as `docs/e2e_tests.md` lists under "Where E2E Code Lives", the step also gets a run-and-see check, as "E2E steps" below describes.
- **Infrastructure in an infra story,** such as a workflow, a script or a config file: run-and-see checks. "Run [command] or [open a PR into `main`], see [result]." Say what the check needs, such as a branch with a failing test.
- **Anything else:** a click-through in the running app. "Go to [view], [do something], see [result]." Say which screen size (phone or desktop) and what data is needed (for example, a day with two meals). If it needs a signed-in user, say which one, as "Which User to Sign In As" in the `running-the-app` skill describes.

Each check ends by saying briefly what it proves, such as "Proves: a re-run Sarah starts doesn't start a second session." Sarah has to be able to tell what a check would teach her before she spends time on it.

Never use "tests pass", "inspect the code" or "types compile" as a check. Tests passing is assumed for every step. Failure, empty and read-only behaviors are checked in the step that builds them.

#### What Sarah checks and what the implementer checks
Whatever kind they are, Sarah's checks prove the finished step works. Any other verification goes in the step's **Approach**, as work the implementing agent does:
- **A case or two per rule.** Give one or two cases that prove each behavior or rule works, not one check per case. A block of cases that share one mechanism, such as the bans in one Biome override, fails together, so one case proves the whole block. If checking every case adds value, or an edge case might slip through, the implementer does it.
- **Only the finished step.** Never give Sarah a check to run before the change to see the old behavior. If her checks compare against the state before the change, such as test counts, the Approach has the implementer record it before changing anything. Her check then compares against what it recorded. Break-it checks aren't before checks: they're edits she makes to the finished step, so they stay.
- **Nothing already shown.** If an earlier check, or a run the implementer can do on its own machine, already shows what a check would prove, drop the check. If that run isn't in the step yet, put it in the Approach as implementer work. For example, breaking a secret on GitHub to see a job fail isn't needed when the implementer can run the job's script against a local server that returns 401.

#### Test-only steps: break-it checks
A step that changes only test files, including shared mocks in `test/mocks/`, changes nothing in the running app, so it gets no click-throughs. Its checks are break-it checks instead. Each one proves that a kept or rewritten test catches real behavior:

"Temporarily change `<file>:<line>` from `<code>` to `<code>`, run `<command> <test file>`, see these tests fail: `<test name>`, `<test name>`. Revert. Proves: <what the tests catch>."

The command is `pnpm vitest run` for a unit test and `pnpm test:e2e` for an E2E spec.

- **Name every test that should fail**, not just the one the check aims at. Read the test file to work out the full list. If a different set fails when the check is run, something is wrong: either the plan misread what the tests cover, or a test is weaker than it looks. An E2E test runs in both the `desktop` and `phone` projects unless it's limited to one, so give the project with each E2E test.
- **Revert every edit** before the next check.
- **Break behavior, not imports.** A break that only breaks imports proves nothing. For example, renaming a shared mock's export to show a test file uses the shared mock fails every importer at once. The `vi.mock` line in the diff already shows which mock a file uses.
- **Breaking a shared mock's behavior counts.** For example, change a default `ok: true` to `ok: false` in `test/mocks/@/_actions/library.ts`, then see the tests that rely on the success default fail.
- **Isolation checks count too.** Add `throw new Error('x')` to a dependency the tests should no longer reach, then see every test in the file still pass.

#### E2E steps: run-and-see checks
A unit test shows nothing in the running app, but an E2E trace is a recording of it. So a test-only step that changes E2E code also gets at least one run-and-see check, alongside its break-it checks. Watching the trace is how Sarah sees for herself that a test does what it claims:

"Run `pnpm test:e2e:trace <spec file>`, open the trace for `<test name>` in `<project>`, see <what the browser does>. Proves: <what the test shows>."

### Coverage
Every behavior and every piece in the approach must land in some step. Nothing can land in a step unless it's in the approach, Sarah pulled it in (see "Out-of-scope items" below), or it's a Boy Scout fix. A Boy Scout fix goes in the step that edits its file, as AGENTS.md describes under "Out-of-scope work".

Coverage also runs back to the note's source material, not just the approach, because the approach can miss things. Every step's **Source:** names the parts of the note it builds or fixes: Requirements bullets, an infra story's Goals, Design Handoff sections, a pattern's Symptoms, a sweep's Items, or a roundup's decided questions. Together the steps must claim every Requirements bullet, every Goal, every Design Handoff section, every Symptom, every remaining sweep Item and every roundup decision. Cite handoff sections by heading, not individual pixel values. The implementer reads those sections for the details.

In a sweep or roundup, items share a step only when they're the same idea, such as one fix repeated across several files. Unrelated items are separate steps, however small.

A step that claims a Symptom needs an acceptance check that follows the original bug's repro steps on the finished step and shows the bug is gone.

### Format
```
## Step N: <short title>
**Idea:** <one sentence, no "and">

**Source:** <what this step builds or fixes from the note, e.g. "Handoff: Day cell states; Handoff: Behavior (all placements) → keyboard", "Requirement 3", "Symptom: new recipe missing from saved dishes dropdown" or "Item: forbidden @tabler/icons-react mocks">

**Approach:** <how, citing the approach's pieces by name or number, e.g. "Piece 9a".>

**Files:**
- `path/to/file.tsx` (new) - reason
- `path/to/other.ts` - reason

**Acceptance:**
- [ ] Go to ..., press ..., see .... Proves: ...
```

### Out-of-scope items
Before you save the draft, triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes its own step, with **Source:** "Pulled in by Sarah YYYY-MM-DD: <the item>". It counts as source material for Coverage, even though the approach doesn't name it.

If the item needs a new piece or a decision the approach doesn't make:
- **A new piece in a feature or infra story:** this skill can't design it. Once Sarah agrees, add it to the Inbox as work for the redesign, set the `^status` line to "Next: /assess (re-assessment)" for a feature or "Next: /infra-design (revision)" for infra, and stop.
- **A decision:** ask Sarah for it. If she answers, the item becomes a step as above, with her answer in its **Source:** ("Pulled in by Sarah YYYY-MM-DD: <the item>. Sarah decided: <answer>"). If her answer needs a new piece, it's the case above. Only if she wants to think it over or research it, add it to Open Decisions as a question, with a `decision needed` entry in `blocked-by` if the note doesn't have one, set the `^status` line to "Next: /decide", and stop.

Save the draft to `.scratch/<note name> - plan.md`.

## 3. Have the plan checked

### Several stories?
A draft plan shows most clearly whether a story is really several. Skip this check if you started from a `# From the Split` section and haven't changed which steps it holds. Otherwise, send the note path and the draft path to the `split-checker` subagent, as the **Plan** checkpoint. Save its report to `.scratch/<note name> - split check.md`.

- **One story:** tell Sarah in one line, link the report, and go on to the plan checker.
- **Split:** follow "Splitting a story" at the end of this skill. That ends this session. Each child gets its own `/plan-steps` in a new session, starting from its share of the draft.

### Plan checker
Send the note path and the draft path to the `plan-checker` subagent. Save its report to `.scratch/<note name> - plan check.md`.

Fix every finding you agree with, then run the checker once more. If you disagree with a finding, leave it as it is and raise it with Sarah in step 4.

## 4. Review with Sarah
1. **The outline.** Show the numbered step titles, each with its idea sentence and a one-line summary of its check. The check line isn't the full acceptance criteria. It just tells Sarah at a glance whether the step is a regression check ("everything looks the same as before") or tests a specific new behavior, and which one. Keep it even when the idea makes the check obvious. Link the draft and the checker report. If the checks already settled the order and the split, say so in one line, with why, and go on. They're settled when the split-checker found one story (or you skipped it because the steps came from `# From the Split`), no plan-checker finding you disagreed with is about order or size, and no step's place in the order was your own judgment call between orders that would both work. Otherwise, ask whether the order and the split are right, and wait for her answer.
2. **Checker findings you disagreed with.** Raise each one. Say what the checker found and why you disagree.
3. **Each step in full.** Show the step and wait for her to approve or change it. If a change affects a later step, say which one and update it before you get there.

## 5. Write it to the note
Once she has approved every step, write the plan under `# Implementation` in the note. If a template comment is there, replace it. If the note has a `# From the Split` section, delete it.

Then:
- Set `status` to `ready`.
- If the story's line in `notes/Roadmap.md` shows its status, update it.
- Update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Ready. Next: /implement Step 1".

## 6. Find a home for out-of-scope items
If the out-of-scope list is empty, you're done.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## Splitting a story
`split-checker` proposes the split. Sarah decides:
1. **Whether to split.** Show the verdict and the reason, plus each child's name and scope line, then ask whether to split. If she says no, carry on as one story.
2. **Each child.** Show what it takes, what blocks it and which design sections it embeds. Wait for her to approve or change it. If a change moves something to another child, update that child before you get to it.
3. **Leftovers.** Raise anything under Unclaimed, and each move to an existing story.
4. **Apply.** Once she has approved every child, apply the note changes from the report. Create the children first, then rewrite the original as the hub, then update the links in other notes. Write each child's Roadmap line as the report gives it, and ask Sarah only where each one goes, as AGENTS.md describes under "Roadmap order".
5. **Hand each child its draft.** Copy each child's share of the draft steps, in full, into its `# From the Split` section. Its own `/plan-steps` runs in a new session and starts from that section.
6. **Route out-of-scope items.** If you've collected any, handle them as in step 6.
7. **Stop.** Don't start work on any child in this session. By now it has read the whole design, the approach, a full draft and the split report, and carrying that into a child's plan bloats the context. Tell Sarah the split is done, and list each child with the command to run in a new session, e.g. `/plan-steps <child name>`.
