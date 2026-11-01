---
name: brainstorm
description: Finds what could be done in an exploration hub by brainstorming and researching with the user, then sorts the options in a quick first pass. Use when a hub's next step is /brainstorm.
argument-hint: "[hub name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Find what could be done in the exploration hub **$ARGUMENTS**, and sort the options.

## 1. Read the Hub
Read all of the hub and the note of the goal it serves. The hub's Child Stories table says what's already scoped, so offer no options for that work. Look at the code, or at the running app as the `running-the-app` skill describes, only enough to know what exists today.

## 2. Find the Options
The Inbox's raw ideas are the first options. Tell the user how you understand the hub, and ask what they have in mind, before you offer any option of your own, because options you offer first anchor what they think of. Then brainstorm with them.

Where research would add options neither of you has, such as what similar apps do or what installed libraries offer, hand it to a subagent that returns a short list of options with their sources, so this session holds only the list and not everything it read. Don't research any one option in depth, because `/decide` does that for the ones that need it. Stop when the user says the list is complete.

## 3. The First Pass
Triage the out-of-scope list first. An item the user pulls in joins the list as an option. Then these are the steps, in order:

1. **Show the list.** Show it whole, grouped by which options would be designed together, with an answer suggested for each: yes in this release, no, needs thought, or worth doing but not in this release. Suggest "needs thought" only where an option truly needs it, because each one becomes a decision, and a decision can cost a research session. Ask which answers or groups to change. This is a deliberate exception to asking one question at a time, because a hub can hold 20 or 30 options and the pass is meant to be quick.
2. **Confirm the suggested noes.** The user only skims the options, and a no leaves no record. So list the suggested noes they left alone, and ask them to confirm. A suggested no they don't confirm takes the answer "needs thought". Every other answer they didn't change stands.
3. **Write each option where its answer sends it:**
   - **Yes, in this release:** the hub's Requirements.
   - **No:** nowhere. It leaves the notes with no record, because the user is sure and nothing later needs it.
   - **Needs thought, or the user is unsure:** a question under Open Decisions, asking whether it's worth doing and whether it's in this release.
   - **Worth doing, but not in this release:** a new Roadmap line in Ideas.
4. **Mark the Requirements.** Start them with a line saying the list below it comes from a first pass the user skimmed, with its date. The line also says the list is a starting point they're tentatively OK with, not decisions. Later steps check with them before relying on an item that looks doubtful. Keep the Requirements heading even if no option is a yes, because `/decide` recognizes an exploration hub by it.

## 4. Divide the Hub
If the groups look like parts that would be designed separately, ask the user whether each should be its own exploration hub, because a hub is designed and cut into stories as one. For each one they split off, these are the steps, in order:

1. **The note.** Write a new hub from `notes/templates/Hub.md` in the original's folder, with a Purpose giving its scope and a Roadmap line under the same heading as the original's.
2. **What moves in.** Move that group's Requirements into the new hub, under a copy of the first-pass line. Move the group's questions and child stories there too, pointing each child's `![[<hub>#Purpose]]` embed at the new hub.
3. **The original.** If it's left with nothing, delete it as the `deleting-a-note` skill describes.

## 5. Update the Status
For each hub, set `confirmed` to today and update the `^status` line for the first case that fits:
- **It has open decisions:** how many remain, such as "4 open decisions. Next: /decide".
- **It already has a design, and the first pass added Requirements:** ask the user what to do, because a hub gets one design.
- **Its Requirements list at least one option, or it has an Inbox item for `/design-feature`:** `Next: /design-feature`.
- **Otherwise:** `Next: its child stories`, and remove its Roadmap line, because a hub has one only while it has a next step of its own.

## 6. Stop
Route the out-of-scope list. Then give each hub's next step as a command, and tell the user to run it in a new session, so it starts with a fresh context.
