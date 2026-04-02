# AFK Task Queue — Orchestrator Guide

Process tasks autonomously while you're away. Drop task notes in Obsidian, run `/orchestrate`, walk away.

## Quick start

1. Create a task note in `~/Documents/Vaults/boldorigins/Claude/Inbox/`
2. Triage it to `Queue/` (move the file, set `status: queue`, set `priority`)
3. Run `/orchestrate` in Claude Code
4. Claude picks up the top task, executes it, and chains to the next

## Creating tasks

### Using the Obsidian template

In Obsidian, create a new note from the `Task` template (Templates/Task.md). Fill in:

- **title**: Short description of the work
- **priority**: 1 (critical) to 7 (nice-to-have). Tasks are processed P1 first.
- **repo**: Path to the git repo (e.g., `~/Projects/myapp`)
- **type**: `feature`, `bugfix`, `refactor`, `test`, `docs`, or `pr`
- **acceptance_criteria**: List of specific, testable criteria
- **dependencies**: List of task IDs that must complete first

### Manually

Create a markdown file in `Claude/Inbox/` with this frontmatter:

```yaml
---
id: "20260331143000"
title: "Add rate limiting to API"
status: inbox
priority: 2
repo: "~/Projects/myapi"
type: feature
created: "2026-03-31"
acceptance_criteria:
  - Rate limiter middleware exists
  - Tests pass with 429 responses
  - README updated
dependencies: []
tags: [claude-task]
---
```

## Triaging tasks

Move task files from `Inbox/` to `Queue/` and update:
- `status: queue`
- Review and adjust `priority`
- Add `dependencies` if needed

Tasks in Queue/ are picked up by the orchestrator. Tasks stay in Inbox/ until you decide they're ready.

## Task lifecycle

```
Inbox → Queue → Active → Done
                  ↓
               (failed)
```

| Status | Location | Meaning |
|--------|----------|---------|
| inbox | Inbox/ | Rough idea, not ready |
| queue | Queue/ | Triaged, ready for pickup |
| active | Active/ | Currently being worked on |
| done | Done/ | Completed successfully |
| failed | Active/ | Failed after retries |

## Running the orchestrator

### Manual (interactive)

```
/orchestrate
```

Picks up one task, executes it, and signals for continuation. The stop hook chains to the next task automatically.

### Scheduled via launchd (fully headless, survives reboots)

```bash
# Install the launch agent
cp ~/.claude/scripts/com.claude.dispatch.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.claude.dispatch.plist

# Verify it's loaded
launchctl list | grep claude

# Test it now (don't wait for 6 AM)
launchctl start com.claude.dispatch

# Check logs
tail -f ~/.claude/logs/dispatch-launchd.log

# Unload (disable scheduling)
launchctl unload ~/Library/LaunchAgents/com.claude.dispatch.plist
```

Runs at 6 AM weekdays. Checks throttle before starting — if battery is low or system is hot, it skips. Uses `caffeinate` to prevent sleep during execution.

### Scheduled via Desktop app

If using the Claude Code Desktop app:
```
/schedule weekday at 6am run /dispatch to process Obsidian task queue
```

### Ad-hoc AFK (in-session)

```
/loop 2h /dispatch
```

Process the queue every 2 hours while your session is open. Stops when you close the session.

### One-shot headless run

```bash
CLAUDE_ORCHESTRATOR_MODE=1 claude -p "/dispatch" --dangerously-skip-permissions
```

## Monitoring

### /queue command

Run `/queue` to see current status:
- Active tasks and duration
- Queued tasks by priority
- Recently completed tasks
- Inbox count

### Obsidian Dataview

Add this to any Obsidian note to see queue status:

````
```dataview
TABLE status, priority, created
FROM "Claude"
WHERE contains(tags, "claude-task")
SORT priority ASC, created ASC
```
````

### Session logs

Each task note has a `## Session Log` section that records what Claude did, including failures and partial progress.

### Daily notes

Completed task summaries appear under `## Claude` in your daily journal entry.

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `OBSIDIAN_VAULT_PATH` | `~/Documents/Vaults/boldorigins` | Vault location |
| `CLAUDE_ORCHESTRATOR_MODE` | unset | Enable chaining in stop hook |
| `ORCHESTRATOR_MAX_SESSIONS` | `10` | Max tasks per orchestrator run |

## Cost controls

- **Haiku triage**: `the-chief` agent uses Haiku to assess complexity before expensive models touch the task
- **Session caps**: Max 10 sessions per run prevents runaway costs
- **Sequential execution**: One task at a time by default (parallel teams are opt-in future work)
- **Complexity routing**: Simple tasks (score 3-5) get direct implementation, not elaborate plans
- **Cost tracking**: `cost_usd` field in task frontmatter records per-task spending

## Troubleshooting

### Stale active tasks

If a task has been in Active/ for over 2 hours, it likely came from a crashed session. The orchestrator detects these and resumes them. You can also manually move them back to Queue/.

### Failed tasks

Check the task's `## Session Log` for failure details. Common causes:
- Tests fail consistently (task may need human review)
- Repo not found (check `repo` path in frontmatter)
- Missing dependencies (check `dependencies` list)

Fix the underlying issue, update `status: queue`, and move back to Queue/.

### Chain didn't continue

Check:
1. `CLAUDE_ORCHESTRATOR_MODE=1` is set
2. Session counter hasn't hit the max (check `~/.claude/orchestrator-session-count`)
3. The previous task completed successfully (check Done/ for the task)
4. There are remaining tasks in Queue/
