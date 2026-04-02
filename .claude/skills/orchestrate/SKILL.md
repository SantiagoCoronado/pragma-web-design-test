---
name: orchestrate
description: Autonomously pick up and complete tasks from the Obsidian queue. Reads Claude/Queue/, claims the top task, executes it, and moves it to Done/.
---

Autonomously process tasks from the Obsidian task queue.

$ARGUMENTS

## Instructions

You are operating in **orchestrator mode** — autonomously picking up, executing, and completing tasks from the Obsidian vault queue.

### Step 0: Bootstrap

Run the agent bootstrap protocol:
1. Detect the tech stack in the current project
2. Load or create best practices for each technology
3. Load project knowledge graph and domain research if available
4. Load project-specific rules from CLAUDE.md

This makes you an expert in this project's stack before you write any code.

### Step 0b: Check throttle

Read the throttle context from the session start (it's in the `additionalContext`). If throttle score > 0.85, announce "Throttle says stop — pausing queue" and print `[ORCHESTRATOR:DONE]`. Respect the model tier and priority cutoff.

### Step 1: Read the queue

Read the task queue from `$OBSIDIAN_VAULT_PATH/Claude/Queue/` (default: `~/Documents/Vaults/boldorigins/Claude/Queue/`).

- List all `.md` files in `Queue/`
- Parse YAML frontmatter from each file
- Sort by `priority` (ascending — P1 is highest) then by `created` date
- Filter by throttle's `max_priority` — skip tasks with priority > the cutoff
- Also check `Active/` for any in-progress tasks that may need resuming
- Check `Routines/` for due routines and auto-generate task notes for them in `Queue/`

If there are no tasks in Queue/ or Active/, announce "Queue empty — nothing to do" and stop.

### Step 2: Check for stale active tasks

Check `Active/` for tasks with `started` timestamps older than 2 hours. These are likely from crashed sessions. If found:
- Read the task's session log for context on what was already done
- Resume work on the stale task instead of claiming a new one

### Step 3: Pick the next task

Select the highest-priority ready task:
1. Skip tasks whose `dependencies` list contains IDs not found in `Done/`
2. Claim it: move the file from `Queue/` to `Active/`, update frontmatter fields:
   - `status: active`
   - `started: <current datetime>`
   - `session_id: <current session identifier>`

### Step 3b: Trace to goal

If the task has a `goal_id` in frontmatter, read the corresponding goal from `Goals/` to understand the bigger picture. This informs your approach — a task linked to a quarterly goal may warrant more thorough testing than a standalone bugfix.

### Step 3c: Domain research (if applicable)

Check if this task requires domain-specific knowledge:
- Does the task have a `domain` field? (e.g., `fiscal`, `financial`, `compliance`)
- Does the task description mention regulations, compliance, tax, legal, or audit?
- Does the project registry list regulated domains for this project?

If yes:
1. Check `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/` for existing research
2. If research exists and is < 30 days old, read and use it as context
3. If missing or stale, run `/research` to gather domain requirements
4. Inject the research brief into your working context before implementing

**This is critical for regulated domains.** A fiscal task in Mexico must comply with SAT regulations. A healthcare task must comply with relevant health data rules. Never implement regulated functionality without checking requirements first.

### Step 4: Assess complexity and route model

Use the `the-chief` agent (Haiku — cheap) to assess the task's complexity (1-12).

Then route the model:
```bash
uv run --no-project ~/.claude/hooks/utils/model_router.py --complexity <score> --json
```

The router combines complexity + throttle to select the optimal model:
- Complexity 1-5 → Haiku (even if throttle allows Opus — don't waste resources)
- Complexity 6-9 → Sonnet (unless throttle caps lower)
- Complexity 10-12 → Opus (unless throttle caps lower)

**Use the router's model selection.** Don't override it.

### Step 5: Execute based on complexity

**Score 3-5 (simple):** Implement directly.
- Read the relevant code
- Make the changes
- Write or update tests for any code changes

**Score 6-8 (moderate):** Plan first.
- Create a brief implementation plan
- Execute the plan step by step
- Write tests alongside implementation
- Run tests after each significant change

**Score 9-12 (complex):** Spec-driven.
- Use the `/spec` skill to create a specification
- Implement according to the spec
- Write comprehensive tests
- Run full verification

### Step 6: Quality gates (before committing)

Run the quality gate checklist (see `rules/quality-gates.md`):

1. **Verify references**: All file paths you created/modified actually exist
2. **Check imports**: All imported modules resolve
3. **Syntax check**: Code parses without errors
4. **Test enforcement**: If you changed code files, test files MUST also exist
5. **Run tests**: Execute the project's test suite — must pass
6. **Self-review**: Read your own diff. Would a human reviewer flag anything?
7. **No secrets**: Scan diff for API keys, tokens, passwords

If tests fail twice on the same issue:
- Mark the task as `failed` in frontmatter
- Append failure details to the session log
- Move on to the next task (do NOT get stuck in a retry loop)

### Step 7: Record metrics

Before committing, measure what you did:
```bash
uv run --no-project ~/.claude/hooks/utils/metrics.py --measure-changes
```

Record the metric with task metadata (task_id, status, model used, complexity, lines, has_tests).

### Step 8: Commit and complete

1. Stage and commit changes with a clear message referencing the task
2. If the task specifies `type: pr`, create a PR
3. Move the task file from `Active/` to `Done/`, update frontmatter:
   - `status: done`
   - `completed: <current datetime>`
4. Append a session log entry to the task note summarizing what was done

### Step 9: Update daily note

Append a summary under `## Claude` in today's journal entry at `$OBSIDIAN_VAULT_PATH/Journal/`:
- Task title and ID
- What was accomplished
- Any issues encountered
- Time taken

### Step 10: Learn

After completing the task, reflect:
- Did you discover a reusable pattern? → Create a skill in `~/.claude/skills/<name>/SKILL.md`
- Did you learn a best practice? → Update `Claude/Knowledge/best-practices/<tech>.md`
- Did you hit a pitfall? → Add to best practices or create a rule
- Did you find a project-specific gotcha? → Note it for future agents

This step is what makes the swarm smarter over time. Skip if the task was trivial.

### Step 11: Parallel subtasks (complex tasks only)

For tasks with complexity score 9-12, consider spawning agent teams within this project:
- Use the `Agent` tool with `isolation: "worktree"` for independent subtasks
- Each teammate runs `/bootstrap` before starting their subtask
- Parallelism budget from throttle (not hardcoded — scales with resources)
- Only parallelize when subtasks are truly independent (different files/modules)

### Step 12: Signal continuation

If there are more ready tasks in `Queue/` **for this repo**:
- Print `[ORCHESTRATOR:CONTINUE]` at the end of your response
- This signals the stop hook to chain another session

If the queue is empty, you've hit the session cap, or all remaining tasks are for other repos:
- Print `[ORCHESTRATOR:DONE]`
- Summarize all tasks completed in this orchestrator run

## Project-Agent Mode

When spawned by the dispatcher (`/dispatch`) inside a specific repo:
- You only process tasks whose `repo` matches the current working directory
- You do NOT check routines (the dispatcher handles that)
- You do NOT dispatch to other repos
- You focus on executing tasks and reporting results back to the vault
- If throttle score changed significantly since dispatch, respect the new constraints
