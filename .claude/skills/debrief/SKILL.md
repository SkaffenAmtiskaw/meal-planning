---
name: debrief
description: Starts a session that works out why an agent went wrong and settles a fix with the user. Use when the user asks for /debrief or accepts an offer of one.
argument-hint: "[what went wrong]"
---

Start a session that works out why an agent went wrong: **$ARGUMENTS**

1. **Find the records:** if the complaint is about this session, its transcript is `$CLAUDE_CODE_SESSION_ID.jsonl` in its checkout's folder under `~/.claude/projects/`, and its app session id is `$CLAUDE_CODE_HOST_SESSION_ID`. If it's about other sessions, send no records, because the new session's transcript search finds the cases.
2. **Start the session** with `start_session`, with `initiation` set to `user_asked` and `context` set to `fresh`. Set `use_worktree` to `true`, so the session can open its own PR. The `prompt` tells the session to invoke the `tooling` skill with the user's complaint, including anything they said about its size or how often it happens, quoted as they gave it in the chat, and the records from step 1. Give it nothing else from this session, such as your own view of what went wrong, because the diagnosis has to reach its own view, and yours would anchor it.
3. **Hand over:** link the new session for the user, and stop.
