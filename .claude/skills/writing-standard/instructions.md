# Agent Instructions
How the standard in `SKILL.md` applies to AGENTS.md, skills and agents, and what else an instruction needs.

## Write for a Smart Reader
The reader is a capable agent that already knows general practice. Add only what it can't know: this project's choices, the user's preferences, where things are and what has gone wrong before.

## Make Every Line Earn Its Place
Instructions load into an agent's context, and the longer they are, the less closely it follows each one. So every line has to earn its place, and a line that tells the agent what it already knows costs attention the lines that matter need. Before keeping a line, or a whole step, ask whether an agent would do the wrong thing without it. Giving a reason, or being the only place something is said, doesn't make it needed.

If the agent or the user would notice a case when it comes up, write no procedure for it if it's either of two kinds: one that's rare and differs each time, such as a note that turns out to need a different type, or one that hasn't happened yet. A procedure for it loads on every run and may not fit when the case comes up, and the agent can raise it with the user then.

## Match Freedom to How Fragile the Task Is
If a task breaks when it's done slightly differently, such as a sequence of commands or a format a script checks, give exact steps. If it takes judgment, give the goal and its reason, and leave the how to the agent. Exact steps for a judgment task make the agent follow them where they don't fit, and a bare goal for a fragile task lets it improvise where it can't.

The same goes for each exact detail, such as a path or a file name. How exact to make it depends on the case:
- **If a hook or script stops the agent as soon as it gets the detail wrong, and says what's allowed:** leave the detail out, because the agent learns it at the moment it acts. For example, a skill doesn't need to say to write its reproducing test in `.scratch/`, because a hook blocks edits outside the notes repo and `.scratch/`.
- **Otherwise, if something depends on it on every run,** such as a script that reads it or a choice the user made: keep it exact.
- **Otherwise:** leave its exact form to the agent.

Before showing a draft, go through its exact details one by one, and ask of each which case it falls in. A detail that's too exact reads as precise writing, so it's easy to miss.

## Reaching Notes
The notes live in their own repo, so a path alone doesn't say where to look. The cases, and what to do in each:
- **An instruction that names a note path:** write it from the notes repo's root and name the repo, such as "`features/` in the notes repo".
- **A script or hook that needs the notes repo's path:** get it from `sh scripts/notes-dir.sh`, the one place that finds the repo from every checkout and in a routine.
- **A skill that sends an agent work involving notes:** put the notes repo's path in the agent's prompt, whatever tools the agent has. Most agents can't run a script, and none loads the AGENTS.md line that names it, so the prompt is the one way that reaches them all.

## Show a Few Good Examples
One or two well-chosen examples teach a pattern better than a list of edge cases. An agent generalizes from a good example, but treats a list of cases as the whole space and misses what it leaves out.

Some parts of a note, such as its approach, sit in different sections depending on the note type. If a line points to one, say how to work out where it is. Listing where it is type by type, whether inline or in bullets, is a list of cases too. Each new type would also need another clause on the line. Add examples only if saying how wouldn't be enough for an agent to find the part.

## No Emphasis Words
Don't write "CRITICAL", "IMPORTANT" or "You MUST". Current models already follow instructions closely, and emphasis makes them apply the rule too broadly, even where it doesn't fit. If a rule matters, give its reason instead.

## Procedure Form
An agent follows structure more reliably than dense paragraphs, so instructions use more of it than a doc does. Each list still holds only separate items:
- **A sequence** is numbered steps.
- **The cases of a rule** are sub-bullets under it, each starting with its condition.

A skill or agent that does a task is laid out as the task's steps, in the order the agent does the work, with each rule at the step that uses it, or, if several steps use it, just ahead of the first of them. An agent acts on what it meets as it reads, so a rule it meets well before its step is out of view when the step comes.

## Descriptions
A skill's or agent's description says, in a sentence or two, what it does, or what a shared-rule skill holds, and when to use it. Everything else goes in the body, because most descriptions load into every session while the body loads only when it runs, and where a description doesn't load, such as a command only the user runs, detail in it is a second copy of the body's. Write it in the third person ("Reviews a draft ...", not "I review ..." or "You can use this to ..."), name the task that calls for it rather than the skills that use it, since that list goes stale, and leave out what other frontmatter shows, such as "Read-only." when `tools:` lists only tools that read.

## Fix Poor Output at Its Source
If a skill or agent produces poor output, give it a check it runs on its own work, rather than a step where the user approves the output first. For example, when routed Roadmap lines came out as walls of text, the fix was for the agent to ask of each detail whether it changes how the story is understood, and cut it if not. The user doesn't want more approvals: each one costs them a review on every run, and output they approve without reading closely still gets through.

## Sections the User Writes by Hand
If a skill reads a note section the user may write by hand, such as a goal's Roadmap Instructions, write the skill to follow what they wrote, in whatever wording or shape, and to ask only when it can't tell what they meant. A template may suggest a format for the section, but pushing back because the user's text doesn't match it only costs them time.
