# Sending a Story Back
The steps, in order:

1. Stop coding, and leave the work as it is.
2. Under the step you were building, add an **As built:** note saying what's done and what isn't. Then add an Inbox item saying why the plan needs to change.
3. Set `status` to `spec`.
4. Update Where It Stands, with a `^status` line such as "Needs re-plan. Next: /investigate" or "Needs re-plan. Next: /infra-design (revision)".
5. Triage and route the out-of-scope list. For each item the user pulls in, add it to that Inbox item, so the next skill plans it.
6. Tell the user to run the next skill in a new session.
