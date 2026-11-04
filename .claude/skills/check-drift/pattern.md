# Re-Auditing a Pattern
The note's Migration Checklist was audited on its `confirmed` date, so code written since then that breaks the Convention isn't on it. In step 3, send the `convention-auditor` subagent only the Convention as written in the note, which is under `# Rules` in an older note. Don't send the note path or the checklist, so the audit isn't anchored to the checklist.

In step 4, compare its report with the checklist. The re-audit only adds to the checklist, so don't change a checklist item just because the report leaves it out. A place fixed since `confirmed` reaches you as a `code-drift-checker` finding. The report's items that need action, and what to do with each:
- **A violation the checklist doesn't list:**
  - **If it's in the checklist's group of places left as they are, or in another story's Migration Checklist, such as another child of the note's hub:** leave it.
  - **Otherwise:** the Convention already says it has to change, so add it to the checklist without asking. Put it in the group it belongs in, with the files the auditor says change with it. Write a callout above it saying the re-audit found it.
- **A place under Unsure:** decide whether it breaks the Convention, as `unclear-places.md` in the `settling-a-decision` skill's folder describes. A place you still can't tell about is a finding that needs a decision.
  - **If the answer settles that place only:** add it to the checklist if it has to change, or to the group of places left as they are if it stays.
  - **If it changes the Convention:** it's an **Approach** finding in step 6.
