---
name: context-check
description: Check context window usage during long sessions. Activate when the conversation has many turns, after large file reads, during implementation sessions, when deciding whether to continue or hand off, or when the user asks about context usage.
version: 1.0.0
---

# Context Window Self-Check

## Usage

1. Copy a 4-6 word unique phrase from the **user's last message** or your **last response** (must already be in the JSONL — never use text from the current turn). Prefer user messages.
2. Run: `node ~/.claude/skills/context-check/check.js "the phrase you copied"`
   (project-level: `.claude/skills/context-check/check.js`)
3. Report the result. Value is from the previous turn — actual usage is slightly higher.
