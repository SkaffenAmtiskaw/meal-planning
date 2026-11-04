---
type: workflow
---
# Where It Stands
Next: /tooling ^status

# Inbox

# Notes
`/architect` may be making rules that are too prescriptive. This note revisits how it makes them, and analyzes whether they are. [[Shared Types Directory]] waits on this work.

Sarah's feedback, 2026-11-03, when she stopped an `/architect` session on [[Shared Types Directory]] and scrapped it:

> These rules are so prescriptive I dislike them. I want guidelines and principles, and agents to ask me in moments of uncertainty. I want to scrap this session and any decisions I made in it. I think we need to revisit how rules work. Add a workflow item to #1 in Next to revisit how architect makes rules, and analyze whether or not it's too prescriptive. I don't want agents making dumb decisions because they can't figure out how to literally apply a rule.

Earlier in the same session, when asked to approve a conventions test for a rule:

> I don't think we need this level enforcement. Make sure it's documented and make sure `final-review` checks project conventions in docs.
>
> This was failing because there was no convention. Now that there is a convention I'd prefer to first try simply documenting the convention. If it still fails then we can get more stringent.
>
> It's possible the agent instructions are too strict about the enforcement section.

The agent's account of what the session produced, as an example to look at: `/architect` step 3 asks each rule for a check that someone can apply by reading one file or one import line, and step 5 sends any place the `rule-auditor` can't apply without judgment back to be sharpened. On where shared types live, five rules grew a deletion test for what a module owns, then a definition of a module, as the audit turned up individual types that didn't fit.
