# Making a Hub
These are the steps, in order:
1. **Draft the hub** from `notes/templates/Hub.md`:
   - **Purpose:** what the idea is, in the user's wording.
   - **Inbox:** if it's an exploration hub, the user's ideas, in their wording, because `/brainstorm` starts from them. If the stories need a shared design that doesn't exist yet, add an item starting "For `/design-feature`:" that names them. `/design-feature` reads it to know which stories its design covers.
   - **Open Decisions:** as step 6 of `SKILL.md` describes.
   - **Child Stories:** each story with its one-line scope.
   - **Where It Stands:** the `^status` line for the first case that fits:
     - **An exploration hub:** `Next: /brainstorm`.
     - **It has open decisions:** how many remain, such as `2 open decisions. Next: /decide`.
     - **It has an Inbox item for `/design-feature`:** `Next: /design-feature`.
     - **Otherwise:** `Next: its child stories`.
2. **Show the user the draft,** and wait for their approval.
3. **Write it** as step 7 of `SKILL.md` describes. If it's an exploration hub, go on to step 6.
4. **One idea note per story.** Create it from `notes/templates/Idea.md`. Under Notes go its one-line scope, the parts of the user's idea that belong to it, in their wording, and `![[<hub>#Purpose]]`. The embed brings the hub's Meta-Instructions to whoever works on the note. If a part of the idea could belong to more than one story, or fits none, ask the user where it goes. Write the notes without showing them first, since the user approved each story's scope in the hub draft. List in your summary which parts of the user's idea went into each.
5. **The Roadmap.** Each story's note gets a line.
6. **Stop.** Don't start the hub's next step or shape any story in this session, so the context from this one doesn't carry over. Give the command to run in a new session for the hub, if its `^status` line names one, and for each story's note, such as `/shape <note name>`.
