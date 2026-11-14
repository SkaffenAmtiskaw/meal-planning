# Docs
How the standard in `SKILL.md` applies to the files in `docs/` and to `README.md`.

## Write for a Reader Who Doesn't Know the Project Yet
A doc's reader may be a person new to this codebase, or an agent, and either may come to it knowing nothing about how the project got here. Near the top, say who the doc is for and what they need to know before reading it, and assume no knowledge beyond that. A doc is read when someone needs it, often before they know the context its writer took for granted.

## Describe the Codebase in a Guide's Voice
A doc describes the codebase: how it's built, where things go and why. It's written in a guide's voice for anyone working on the code, not as instructions to an agent. It explains what's normal and why, and leaves judgment to the reader, the way a reviewer would call out messy mocks in a PR, rather than setting a hard rule such as moving a mock to `test/mocks/` once 3 test files use it. A rule applied by rote misfires on the cases it didn't foresee, while a reader who understands the aim can make the right call.

So a doc states something as a rule only when breaking it causes a real problem, such as a bug, a failing or flaky test, a security hole, lost data or code that later changes struggle with. The rule says what that problem is. Otherwise, how code is laid out, named or split is left to whoever writes it.

A doc says where things live rather than listing them: a folder and what it holds, not each helper, file or signature in it. A reader finds those by looking, and a list of them goes wrong at the next rename.

A doc leaves out how an outside service behaves, such as where GitHub sends a run's logs or a limit on its API, because the service can change without anyone noticing that the doc is out of date. What this project sets up in a service, such as a secret's name or a ruleset, is part of the repo's setup, so a doc records it.

If what you're drafting is a rule only agents follow, such as when to use `pnpm test:agent`, place it as the `rule-placement` skill describes.

A doc that grows from a pattern's Convention is still a guide: what to do, where things go and why, not a numbered list of rules with their checks. Enforcement, such as a Biome ban or a type check, gets at most one short closing paragraph, for anyone who needs to change it. Even there, name only enforcement whose location isn't obvious. A TypeScript error that names the problem and points at the file explains itself, while a test that happens to guard unrelated code is worth naming.

## Set Detail Apart in a Callout
A person reading a doc usually wants a section's main point, so it's the first thing they see. If what follows the point runs longer than a sentence or two, such as the reasoning behind a choice, background or a rare case, put it in a `> [!NOTE]` callout after the point. Otherwise the reader has to dig through a long paragraph for the rule. The callout keeps the detail for a reader who wants it and lets the rest skip it.

## Keep Each Doc to One Kind
Each doc is one kind of document:
- **A how-to** walks through doing a task.
- **A reference** is where the reader looks up facts, such as commands, options or which library to use for what.
- **An explanation** says how something works and why it's built that way.

A reader comes to a doc with one of these needs at a time, and a doc that mixes them makes every reader skip past the parts they didn't come for.

## Prose by Default
In a doc, connected ideas are prose: a guide's reasons and cases read best as sentences. A list fits the steps of a how-to and items that truly stand apart, and a table fits reference facts that share the same fields.
