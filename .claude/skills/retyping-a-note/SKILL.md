---
name: retyping-a-note
description: How to move a story note to another type once work on it has started, carrying the approved content that still makes sense into the new type's sections, and how the next skill treats that content. Use when a note's type doesn't fit its work, or when a skill finds a retype line in a note's Inbox.
user-invocable: false
---

# Why retyping works this way
A story's type picks its template, and each skill after `/shape` knows only its own type's sections. A note that turns out to be the wrong type, such as a pattern that is really infrastructure, holds sections the new template doesn't have. The next skill would redraft or drop content Sarah already approved. So a retype carries each approved piece that still makes sense into the section where it now belongs, and marks what it carried, so the next skill keeps it rather than asking her again.

A wrong type usually leaves a lot of cruft behind, such as a pattern's Enforcement on work that has nothing to enforce. Content that doesn't make sense for the new type, and isn't needed for the story to be done, is dropped, even if Sarah approved it. She sees each drop before anything is written.

# Retyping a note
1. **Read the new type's rules.** Read its template in `notes/templates/`, and its rows in the Next Step by Note State table in `notes/Note Conventions.md`.
2. **Sort the note's content.** Go through every section of the note. Each piece goes one of two ways:
   - **Carried:** it makes sense for the new type. Put it in the section of the new template where it belongs. Keep its wording, and reword it only as far as the new section needs, such as a Rule's title becoming a convention's. Sarah's comments move unchanged. Open Decisions, with their **Decided**, **Leaning** and **Rejected** lines, carry as they are.
   - **Dropped:** it doesn't make sense for the new type, and the story can be done without it.
3. **Set the frontmatter, Where It Stands and the Inbox.**
   - `type`: the new type.
   - `status`: the furthest stage the carried content supports under the new type, going by the Next Step table. For example, a note whose carried content fills some but not all of the sections `/infra-design` writes is `idea`. A `ready` note goes back to `spec` as AGENTS.md describes under "Editing notes", since its design has changed.
   - `blocked-by`: keep the entries that still apply.
   - `confirmed`: today. Sarah approving a retype counts as re-shaping the note.
   - The `^status` line: the new type's next step, e.g. "Retyped. Next: /infra-design".
   - In the Inbox, the retype line: "Retyped from <old type> on <date>. Carried as approved: <each section of the new template that holds carried content>." The next skill relies on this line, so name every section, even one that holds a single carried piece.
4. **Show Sarah the draft.** Print the whole retyped note in the chat. Under it, list every dropped piece, one line each: what it was, which section it was in, and why it no longer makes sense. If a dropped piece is one of Sarah's comments, ask about it separately, as AGENTS.md describes under "Editing notes". Wait for her to approve or change the draft.
5. **Write it.** Rewrite the note in place so links to it keep working. The Roadmap line stays where it is.
6. **Stop.** Tell Sarah the new type's next step, to run in a new session.

# After a retype
If a note's Inbox has a retype line, the sections it names hold content Sarah already approved:
- **Keep them.** Don't redraft them or take her through them again. Draft only the sections the line doesn't name.
- **Raise a carried piece** only when it doesn't fit the section it's in, or when new information makes it look wrong. Show her what you found and which piece it changes, and let her decide.
- **When your skill has written its sections,** remove the retype line. From then on, the note reads like any other note of its type.
