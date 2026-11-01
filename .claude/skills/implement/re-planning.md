# Re-planning
When the plan itself has to change, what you do depends on the story and the change:
- **An infra story:**
  - **If the Design itself has to be reworked,** such as a Piece that can't work as designed: follow the steps below, with `/infra-design` as the next skill.
  - **If the change is the user's call:** ask them about it, as AGENTS.md's "Her decisions can change" describes. Once they decide, make the change in the note as that section describes, and keep building.
  - **Otherwise,** when the change touches only choices the user merely signed off on, such as the order of the Build Order's steps, the step a Piece is built in or a check's wording: make the change in the note yourself, as that section describes, and keep building.
- **A bug story whose Root Cause turned out wrong:** follow the steps below, with `/investigate` as the next skill, since it settles the Root Cause and Fix that `/plan-steps` plans from.
- **A pattern story whose Rule has to change:** follow the steps below, with `/architect` as the next skill, since it reworks the Rule and its Enforcement and re-audits the code before `/plan-steps` plans from them.
- **Any other story:** follow the steps below, with `/plan-steps` as the next skill.

1. Stop coding, and leave the work as it is.
2. Add an **As built:** note under the step saying what's done and what isn't, and an Inbox item saying why the plan needs to change.
3. Set `status` to `spec`.
4. Update Where It Stands, with a `^status` line such as "Needs re-plan. Next: /plan-steps" or "Needs re-plan. Next: /infra-design (revision)".
5. Triage and route the out-of-scope list. Add each item the user pulls in to the Inbox item from step 2, so the next skill plans it.
6. Tell the user to run the next skill in a new session.
