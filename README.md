# claude-context-check

A Claude Code skill that lets Claude check its own context window usage.

## The problem

Claude Code shows context usage in the UI (`/context`), but Claude itself can't see how much context it's used. It flies blind until auto-compaction kicks in, often mid-task.

## What this does

Teaches Claude to read its session JSONL to get precise token counts. The skill is minimal and unopinionated — it just gives Claude the ability to check. What Claude does with that information is up to you (add thresholds to your CLAUDE.md, project memory, etc).

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

After installing, run `/skills` to reload or restart Claude Code.

## Customization

The skill just teaches Claude *how* to check. To control *when* and *what to do*, tell Claude your preferences — in CLAUDE.md, project memory, or just in conversation. Examples:

- "Check context every 5 turns and warn me at 70%"
- "When context exceeds 80%, suggest /compact"
- "Never auto-stop, just report the number when I ask"

## How it works

Claude Code writes session data to `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`. Each API response includes token counts in a `usage` field. The skill teaches Claude to find the current session file, trace the current conversation chain via `parentUuid` links (to avoid stale data after `/clear`), and report total input tokens as a percentage of the 200k context window.

## Limitations

- On the first turn after `/clear`, reports no data (accurate data starts from the second turn)
- May not work reliably with subagents — they have separate context windows but share the same session JSONL, so usage numbers can get mixed up
