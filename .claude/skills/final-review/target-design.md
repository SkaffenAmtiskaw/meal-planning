# Target Design
The steps of check 2 on a feature, in order:

1. Send the `target-designer` subagent the story's behaviors, numbered, from the Suggested Approach or wherever the note lists them. Also send it the paths to the note's Meta-Instructions, its Design Handoff sections, its images and its artboards. Give it nothing else, so its design isn't anchored to the built code or the rest of the Suggested Approach.
2. When its design comes back, read the story's files. List each file under the target piece it fills. A file that fills no piece goes on this list too, marked "no target piece". If the story changed that file only to wire a piece in, such as a layout that mounts a provider, the list entry is enough. Otherwise, the file is also a finding, because the fresh design didn't need its job.
3. Send the list to the `code-critic` subagent: each target piece with its job, and the files listed under it. Tell it the story is already built. Don't pre-judge the code for it.
