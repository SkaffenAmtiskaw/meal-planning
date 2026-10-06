# Docs
How the standard in `SKILL.md` applies to the files in `docs/` and to `README.md`.

## Write for a Reader Who Doesn't Know the Project Yet
A doc's reader may be a person new to this codebase, or an agent, and either may come to it knowing nothing about how the project got here. Near the top, say who the doc is for and what they need to know before reading it, and assume no knowledge beyond that. A doc is read when someone needs it, often before they know the context its writer took for granted.

## Describe the Codebase in a Guide's Voice
A doc describes the codebase: how it's built, where things go and why. It's written in a guide's voice for anyone working on the code, not as instructions to an agent. It explains what's normal and why, and leaves judgment to the reader, the way a reviewer would call out messy mocks in a PR, rather than setting a hard rule such as moving a mock to `test/mocks/` once 3 test files use it. A rule applied by rote misfires on the cases it didn't foresee, while a reader who understands the aim can make the right call.

If what you're drafting is a rule only agents follow, such as when to use `pnpm test:agent`, it doesn't go in a doc, even when it's about code. Place it as the `rule-placement` skill describes instead. A doc is for everyone who works on the code, and an agent rule belongs where agents load it.

A doc that grows from a pattern's Rules is still a guide: what to do, where things go and why, not a numbered list of rules with their checks. Enforcement, such as a Biome ban or a type check, gets at most one short closing paragraph, for anyone who needs to change it. Even there, name only enforcement whose location isn't obvious. A TypeScript error that names the problem and points at the file explains itself, while a test that happens to guard unrelated code is worth naming.

## Keep Each Doc to One Kind
Each doc is one kind of document:
- **A how-to** walks through doing a task.
- **A reference** is where the reader looks up facts, such as commands, options or which library to use for what.
- **An explanation** says how something works and why it's built that way.

A reader comes to a doc with one of these needs at a time, and a doc that mixes them makes every reader skip past the parts they didn't come for.

## Prose by Default
In a doc, connected ideas are prose: a guide's reasons and cases read best as sentences. A list fits the steps of a how-to and items that truly stand apart, and a table fits reference facts that share the same fields.
