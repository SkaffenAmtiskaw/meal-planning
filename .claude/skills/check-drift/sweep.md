# Sorting a Sweep's Findings
1. Sort the checkers' findings for each item. A sweep's items must stay small and decided, so a finding changes the item and leaves no callout. The cases where a finding changes more than a name, path or line number, and what to do in each:
   - **Already fixed, or built by another story:** delete the item.
   - **Now needs a decision:** delete the item and put it on the out-of-scope list. Don't ask whether to settle it yet, because triage is where the user chooses to pull it back in, route it or drop it.
   - **Now waits on another story:** what you do depends on whether that story is in this release, meaning its Roadmap line is in Now or Next:
     - **If it is:** keep the item, and add the story to the sweep's `blocked-by`. Holding the other items costs little, because a release ships all at once.
     - **Otherwise:** move the item to the collecting note this sweep was frozen from. Mark it as blocked, as the Sweep template's Items comment describes, so it rolls over to the next kickoff.
2. Triage the out-of-scope list. If an item the user pulls in still needs a decision, ask them for it. A sweep can't hold an open decision, so if they want to think it over, offer route or drop only. Add each item that's pulled in and decided as a new unchecked box under Items, written as the Sweep template's Items comment describes. Add "Pulled in by <their name> YYYY-MM-DD" to it, and any answer they gave ("<their name> decided: ...").
