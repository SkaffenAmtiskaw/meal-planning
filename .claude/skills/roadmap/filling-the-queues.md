# Filling the Queues
The steps to bring Next and Planning in line when a goal has just become the building or planning goal, in order:

1. **Sort the lines already in Next and Planning.** Each line goes where its goals and markers now put it, as the `roadmap-rules` skill describes. A line that fits neither queue goes back to Later.
2. **Fill the queue of each goal that just became the building or planning goal.** Go through every Later line that serves the goal: the lines under its heading and the lines carrying its 🎯 link. Ask the user which lines move into its queue.
3. **If a goal just became the building goal, add what joins the release.** Handle these in order, because freezing a dated copy reads Next to see which stories are in the release:
   1. For each line under the Bugs heading whose `^status` line doesn't say it's blocked, move it into Next and end it with 🔁.
   2. Go through each sweep and collecting workflow note that isn't a dated copy. For each one, work out which items `freezing-a-copy.md` in this folder would keep in a copy. If it would keep any, freeze a dated copy as that file describes. Give the copy its Roadmap line as the `roadmap-rules` skill describes under "Collecting notes".
4. **Place the lines that joined each queue, whichever step moved them.** Lines moved together from one section keep their order, so ask the user where that block goes. Ask where each other line that joined goes.
