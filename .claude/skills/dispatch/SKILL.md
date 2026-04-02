---
name: dispatch
description: Root-level task dispatcher. Reads the Obsidian queue, groups tasks by repo, checks throttle, and spawns project-level Claude sessions. Run this from ~/ to process tasks across multiple projects.
---

Dispatch tasks from the Obsidian queue to project-level agents.

$ARGUMENTS

## Instructions

You are the **root dispatcher**. You run from `~/` and coordinate work across all projects.

### Step 1: Check throttle

```bash
uv run --no-project ~/.claude/hooks/utils/throttle.py --json
```

Read the throttle decision. This determines:
- How many parallel sessions you can run (score < 0.25 = up to 3, otherwise sequential)
- Which model tier to use
- Which priority levels to include

If `should_stop` is true, announce "Throttle says stop" and exit.

### Step 2: Check for due routines

Read `$OBSIDIAN_VAULT_PATH/Claude/Routines/*.md` for routines past their `next_run` date. For each due routine:
1. Create a task note in `Queue/` based on the routine's description
2. Set `routine_id` in the task frontmatter linking back to the routine
3. Update the routine's `last_run` and compute `next_run`

### Step 3: Read and group the queue

Read all `.md` files from `$OBSIDIAN_VAULT_PATH/Claude/Queue/` (default: `~/Documents/Vaults/boldorigins/Claude/Queue/`).

- Parse frontmatter from each file
- Filter by throttle's priority cutoff
- Group tasks by `repo` field
- Sort within each group by priority then created date

Also check `Active/` for stale tasks (started > 2 hours ago) — these may need recovery.

### Step 3b: Bootstrap each task

For each task, the executing agent MUST run the bootstrap protocol (see `rules/agent-bootstrap.md`):
- Detect stack from the target repo
- Load/create best practices for the detected technologies
- Load domain knowledge if applicable
- Load project-specific rules

This happens inside each spawned agent, not in the dispatcher. The dispatcher just ensures tasks are grouped and dispatched — agents self-bootstrap.

### Step 4: Dispatch strategy

Based on the number of tasks, repos, and throttle score:

**Parallelism budget** (controlled by throttle + env):
- `ORCHESTRATOR_MAX_PARALLEL` env var (default: 5, max: 50)
- Throttle score adjusts: GREEN (< 0.25) = full budget, YELLOW (0.25-0.5) = half, ORANGE (0.5-0.75) = 2 max, RED (> 0.75) = sequential

**Single repo, few tasks (< 5):**
- Run `/orchestrate` directly — sequential within repo, stop hook chains

**Single repo, many independent tasks (5+):**
- Use Agent tool with `isolation: "worktree"` to parallelize within the repo
- Each agent gets its own worktree — no git conflicts
- Up to `max_parallel` agents simultaneously

**Multiple repos:**
- Spawn parallel sessions across repos (independent by definition)
- Within each repo, use worktrees for further parallelism if tasks are independent
  ```bash
  # Spawn N parallel sessions
  for repo in "${REPOS[@]}"; do
    CLAUDE_ORCHESTRATOR_MODE=1 claude -p "Run /bootstrap then /orchestrate" \
      --cwd "$repo" --dangerously-skip-permissions &
    PIDS+=($!)
  done
  wait "${PIDS[@]}"
  ```

**Task independence detection:**
- Different files/directories → independent (can parallelize)
- Same file → dependent (must serialize)
- Different repos → always independent
- Check `dependencies` field in frontmatter — never parallelize tasks with dep chains

### Step 4b: Post-task learning

After each task completes, the executing agent should run `/learn` to:
- Capture reusable patterns as new skills
- Update best practices with discoveries
- Add project-specific gotchas to CLAUDE.md

This is how the swarm gets smarter over time.

### Step 5: Monitor and collect results

After all dispatched sessions complete:

1. Count newly completed tasks in `Done/`
2. Check for failed tasks still in `Active/`
3. Compute total session count and estimated cost
4. Append dispatch summary to today's daily note

### Step 6: Report

Print a summary:
```
Dispatch complete:
  Repos processed: 3
  Tasks completed: 7
  Tasks failed: 1
  Sessions used: 4/10
  Throttle: 0.32 (memory)
```

If tasks remain in the queue and sessions are under the cap, print `[ORCHESTRATOR:CONTINUE]`.
If done, print `[ORCHESTRATOR:DONE]`.
