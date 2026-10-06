# Agent Instructions
How the standard in `SKILL.md` applies to AGENTS.md, skills and agents.

## Write for a Smart Reader
The reader is a capable agent that already knows general practice. Add only what it can't know: this project's choices, Sarah's preferences, where things are and what has gone wrong before. This is the opposite of a doc, whose reader may know nothing about the project yet.

## Make Every Line Earn Its Place
Instructions load into an agent's context, and the longer they are, the less closely it follows each one. So every line has to earn its place, and a line that tells the agent what it already knows costs attention the lines that matter need. Before keeping a line, ask whether an agent would do the wrong thing without it.

## Match Freedom to How Fragile the Task Is
If a task breaks when it's done slightly differently, such as a sequence of commands or a format a script checks, give exact steps. If it takes judgment, give the goal and its reason, and leave the how to the agent. Exact steps for a judgment task make the agent follow them where they don't fit, and a bare goal for a fragile task lets it improvise where it can't.

## Show a Few Good Examples
One or two well-chosen examples teach a pattern better than a list of edge cases. An agent generalizes from a good example, but treats a list of cases as the whole space and misses what it leaves out.

## No Emphasis Words
Don't write "CRITICAL", "IMPORTANT" or "You MUST". Current models already follow instructions closely, and emphasis makes them apply the rule too broadly, even where it doesn't fit. If a rule matters, give its reason instead.

## Procedure Form
An agent follows structure more reliably than dense paragraphs, so instructions use more of it than a doc does. Each list still holds only separate items:
- **A sequence** is numbered steps.
- **The cases of a rule** are sub-bullets under it, each starting with its condition.
- **A skill's description** is in the third person and says what the skill does and when to use it, because it's what an agent reads to decide whether to load the skill.
