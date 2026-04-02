---
description: Show and manage recurring routines from the Obsidian vault
---
Show the current routines status from the Obsidian vault.

Read routine definitions from `$OBSIDIAN_VAULT_PATH/Claude/Routines/` (default: `~/Documents/Vaults/boldorigins/Claude/Routines/`):

1. **List all routines** — Read `Routines/*.md`, parse frontmatter, show:
   - Title, schedule (cron expression, human-readable), enabled/disabled
   - Last run date, next expected run
   - Priority

2. **Show due routines** — Check which routines are past their `next_run` date and should be queued

3. **Format as table:**

```
## Routines

| Routine | Schedule | Last Run | Next Run | Status |
|---------|----------|----------|----------|--------|
| Daily vault cleanup | Weekdays 6 AM | 2026-03-30 | 2026-03-31 | DUE |
| Weekly summary | Mondays 9 AM | 2026-03-24 | 2026-03-31 | DUE |
| Monthly review | 1st of month | 2026-03-01 | 2026-04-01 | Scheduled |

2 routines due for execution.
```

If the user passes `generate` as an argument, generate task notes in `Queue/` for all due routines (copy routine description into a task, link back to the routine, update `last_run` and `next_run`).
