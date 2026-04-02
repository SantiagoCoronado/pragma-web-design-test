# Parallel by Default

Agents MUST parallelize work whenever tasks are independent. Sequential execution is the exception, not the rule.

## When to parallelize

- **Multiple independent tasks in the queue**: Different files, different modules, different repos → parallelize
- **Complex tasks that decompose**: A task that touches 3+ independent modules → spawn agent teams
- **Cross-repo work**: Always parallel — repos are independent by definition
- **Test suites**: Run tests in parallel when the framework supports it

## How to parallelize

### Within a session (agent teams)
Use the `Agent` tool with `isolation: "worktree"` for each independent subtask:
```
Agent(prompt="...", isolation="worktree", run_in_background=true)
```

- Each agent gets its own git worktree — no merge conflicts
- Agents work independently, no coordination needed
- Results merge back automatically when worktrees complete
- Launch multiple agents in a single message for true concurrency

### Across sessions (dispatcher)
The dispatcher spawns parallel `claude -p` sessions, one per repo:
- Each session is fully independent
- Each self-bootstraps with the right context
- Results flow back to the Obsidian vault

## When NOT to parallelize

- Tasks that modify the same file (will conflict)
- Tasks with explicit `dependencies` in frontmatter
- Database migrations (must be sequential)
- Tasks that share mutable state (same DB table, same API endpoint)

## Parallelism budget

The throttle controls how many parallel agents you can run:
- `ORCHESTRATOR_MAX_PARALLEL` env var (default: 5)
- Throttle GREEN (< 0.25): full budget
- Throttle YELLOW (0.25-0.5): half budget
- Throttle ORANGE (0.5-0.75): max 2
- Throttle RED (> 0.75): sequential only

## Independence detection

Before parallelizing, verify independence:
1. List all files each task will likely touch (from description + knowledge graph)
2. If file sets don't overlap → independent → parallelize
3. If file sets overlap → dependent → serialize or split the overlap
4. When in doubt, use worktree isolation — it handles conflicts safely

## Key principle

200 agents running independently is better than 1 agent running 200 tasks sequentially. Every minute an agent waits for another agent is wasted compute. Parallelize aggressively, let worktrees handle isolation.
