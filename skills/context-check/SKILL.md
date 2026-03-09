---
name: context-check
description: Check context window usage during long sessions. Activate when the conversation has many turns, after large file reads, during implementation sessions, when deciding whether to continue or hand off, or when the user asks about context usage.
version: 1.0.0
---

# Context Window Self-Check

Read your session JSONL to get precise token usage.

## How to check

Run `check.js` (located next to this file):

```bash
node ~/.claude/skills/context-check/check.js
```

If installed at project level, use `.claude/skills/context-check/check.js` instead.

The script uses the Skill tool invocation entry in the session JSONL to identify the current session and read usage from the same API call. No marker or extra steps needed.
