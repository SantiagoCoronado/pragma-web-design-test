---
description: Show the current state of the Obsidian task queue
---
Show the current task queue status from the Obsidian vault.

Read tasks from `$OBSIDIAN_VAULT_PATH/Claude/` (default: `~/Documents/Vaults/boldorigins/Claude/`):

1. **Active** — Read `Active/*.md`, show each task's title, priority, started time, and how long it's been running
2. **Queue** — Read `Queue/*.md`, sort by priority then created date, show title, priority, type, and dependencies
3. **Recently Done** — Read the 5 most recently completed tasks from `Done/*.md`, show title, completed date
4. **Inbox** — Count files in `Inbox/` (don't show details, just the count)

Format as a clean table:

```
## Active (1)
| Task | Priority | Started | Duration |
|------|----------|---------|----------|

## Queue (3)
| # | Task | Priority | Type | Deps |
|---|------|----------|------|------|

## Recently Done (5)
| Task | Completed |
|------|-----------|

Inbox: 2 tasks awaiting triage
```

If any Active tasks have been running for over 2 hours, flag them as potentially stale.
