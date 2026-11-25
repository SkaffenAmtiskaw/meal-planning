# Offering the Next Session
A skill that finishes a step in a worktree hands the user the next command from the note's `^status` line.

Before you hand it on, run `git status`. If it lists anything, show the user the files, ask whether to commit them, and wait for their answer. If they say yes, commit them. If this session opened the branch's PR, also push, so the commit reaches the PR before it merges. Then hand on the command.

How you hand it on depends on whether this session opened the branch's PR and, if it didn't, on where that command runs:
- **If this session opened the branch's PR:** this worktree's work is done. End the turn by asking in `wrap_up` whether to archive this session. In the message after it, give the user the command to run in a new session outside this worktree.
- **If the next command builds or reviews this branch,** such as `/implement`, `/infra-build` or `/final-review`: it runs in this session. A session started for it would nest under this one. The steps, in order:
  1. Rename this session with `set_session_title` to `<Skill> - <Note Name> (Step <N>)`, naming the next command's skill and step, such as "Implement - Drop Mongoose (Step 5)". Leave out the step if the command has none, as in "Final Review - Drop Mongoose". The user often leaves between steps, and the title is how they see where the story stands when they come back. The skill in it also tells this session apart from a planning session for the same note.
  2. Give the user the command with the note's name, such as `/infra-build <note name>`, to type here when they're ready. Tell them the session clears its conversation when this turn ends, and that "Resume previous session" brings this step's conversation back.
  3. As your last call, clear this session's conversation with `clear_session` and `session_id` "self", so the next step starts with an empty context.
- **Otherwise,** such as `/close` or a planning skill: it runs in the main checkout. Give the user the command to run in a new session there.
