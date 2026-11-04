# Re-Auditing a Pattern
The note's Migration Checklist was audited on its `confirmed` date, so code written since then that breaks the Rules isn't on it. In step 3, send the `rule-auditor` subagent only the Rules as written in the note, not the note path or the checklist, so the audit isn't anchored to the checklist.

In step 4, compare its report with the checklist. The re-audit only adds to the checklist, so don't change a checklist item just because the report leaves it out. An audit never reports Enforcement, Docs or forward-looking items. A place fixed since `confirmed` reaches you as a `code-drift-checker` finding. The report's items that need action, and what to do with each:
- **A violation the checklist doesn't list:**
  - **If another story, such as another child of the note's hub, lists it in its own Migration Checklist:** leave it, because that story migrates it.
  - **Otherwise:** the Rules already say it has to change, so add it to the checklist without asking. Put it in the group it belongs in, with the files the auditor says change with it. Write a callout above it saying the re-audit found it.
- **A place under Unclear:** write a callout on that rule saying what the auditor was unsure about, and leave it for `/architect`, which sharpens rules with the user and re-audits them.
- **An item under Outside These Rules:** put it on the out-of-scope list.
