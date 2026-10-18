# Re-planning
When the plan itself has to change, what you do depends on the story and the change:
- **An infra story, where the change touches only choices the user merely signed off on,** not ones they made themselves or care about (AGENTS.md tells the two apart under "Her decisions can change"), such as the order of the Build Order's steps, which step builds a Piece or a check's wording: make the change in the note yourself, as that section describes, and keep building. The story keeps its status.
- **An infra story, where the change is the user's call:** ask them about it, as that AGENTS.md section describes. Once they decide, make it in the note the same way and keep building.
- **An infra story, where the Design itself has to be reworked,** such as a Piece that can't work as designed: follow the steps below, with `/infra-design` as the next skill.
- **Any other story:** follow the steps below, with `/plan-steps` as the next skill.

1. Stop coding, and leave the work as it is.
2. Add an **As built:** note under the step saying what's done and what isn't, and an Inbox item saying why the plan needs to change.
3. Set `status` to `spec`.
4. Update Where It Stands, with a `^status` line such as "Needs re-plan. Next: /plan-steps" or "Needs re-plan. Next: /infra-design (revision)".
5. Triage and route the out-of-scope list.
6. Tell the user to run the next skill in a new session.
