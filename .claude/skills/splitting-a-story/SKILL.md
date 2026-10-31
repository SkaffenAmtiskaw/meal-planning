---
name: splitting-a-story
description: How to take the user through a split that the split-checker agent proposes, and apply the parts they approve. Use when split-checker proposes splitting a story.
user-invocable: false
---

# Splitting a Story
`split-checker` proposes a split. Go through it with the user in this order, then apply what they approve:
1. **Whether to split.** Show each child's name and scope line from `split-checker`'s report. Then show why each hidden story that shares the design passes the test, from the **Passes the test because** lines in `hidden-story-checker`'s report, and ask whether to split.
2. **Each child.** Show what it takes, what blocks it and which design sections it embeds, and wait for the user to approve or change it. If a change moves something to another child, update that child before you get to it.
3. **Leftovers.** Raise anything under Unclaimed and ask which child takes it, if any, and ask whether each move to an existing story goes ahead.
4. **Apply.** Once the user has approved every child, apply the note changes from the report, with the user's answers to items 2 and 3. Create the children first, then rewrite the original as the hub, then update the links in other notes, so no link ever points to a note that doesn't exist yet. Write each child's Roadmap line in the words the report gives.
