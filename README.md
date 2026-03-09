# claude-context-check

A Claude Code skill that lets Claude check its own context window usage.

## The problem

Claude Code shows context usage in the UI (`/context`), but Claude itself can't see how much context it's used. It flies blind until auto-compaction kicks in, often mid-task.

## Features

- **Precise token counts** — reads actual API usage data from session JSONL, not estimates
- **Multi-instance safe** — uses a conversation-anchored lookup to find the correct session file, even with multiple Claude instances running in the same project
- **Subagent aware** — works inside subagents, reporting their own context window usage
- **Unopinionated** — just reports the number; behavior at thresholds is up to you
- **Minimal footprint** — ~60 lines of JS, ~240 tokens of skill prompt
- **No dependencies** — runs with Node.js (already required by Claude Code)

## Install

User-level (all projects):

```bash
mkdir -p ~/.claude/skills/context-check
curl -so ~/.claude/skills/context-check/SKILL.md \
  https://raw.githubusercontent.com/dn00/claude-context-check/main/skills/context-check/SKILL.md
curl -so ~/.claude/skills/context-check/check.js \
  https://raw.githubusercontent.com/dn00/claude-context-check/main/skills/context-check/check.js
```

Single project:

```bash
mkdir -p .claude/skills/context-check
curl -so .claude/skills/context-check/SKILL.md \
  https://raw.githubusercontent.com/dn00/claude-context-check/main/skills/context-check/SKILL.md
curl -so .claude/skills/context-check/check.js \
  https://raw.githubusercontent.com/dn00/claude-context-check/main/skills/context-check/check.js
```

Or just ask Claude:

```
Fetch https://raw.githubusercontent.com/dn00/claude-context-check/main/skills/context-check/SKILL.md and https://raw.githubusercontent.com/dn00/claude-context-check/main/skills/context-check/check.js — save both files to a context-check skill directory. Ask me if I want it installed at the project level or user level.
```

After installing, restart Claude Code to load the skill.

## Customization

The skill just teaches Claude *how* to check. To control *when* and *what to do*, tell Claude your preferences — in CLAUDE.md, project memory, or just in conversation. Examples:

- "Check context every 5 turns and warn me at 70%"
- "When context exceeds 80%, suggest /compact"
- "Never auto-stop, just report the number when I ask"

## How it works

Claude Code writes session data to `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`. Each API response includes token counts in a `usage` field.

When Claude checks context, it picks a unique phrase from its previous response and passes it to `check.js`. The script uses that phrase to identify the correct session file among potentially many (multiple instances, subagent sessions), then reads the last usage entry from that file. Total context is calculated as `input_tokens + cache_creation_input_tokens + cache_read_input_tokens` and reported as a percentage of the 200k window.

## Limitations

- Reports usage from the *previous* turn (current turn isn't written to JSONL yet), so actual usage is slightly higher than reported
