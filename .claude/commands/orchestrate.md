---
description: Decompose a task into parallel sessions and run them
---

The user wants to run multiple Claude Code sessions in parallel. Their request:

$ARGUMENTS

## Instructions

1. **Analyze the request** — identify what independent subtasks can be parallelized
2. **Read relevant context** — understand the codebase structure, available agents, and current state
3. **Decompose** — break into self-contained tasks with specific prompts
4. **Present the plan** — show the user what you'll spawn before doing it:
   - Number of sessions
   - Model and budget per session
   - Total estimated cost
   - Agent and working directory for each
5. **Wait for confirmation** — do not spawn until the user approves
6. **Spawn** — use `orchestrator_batch` or individual `orchestrator_spawn` calls
7. **Monitor** — poll `orchestrator_list` periodically, report progress
8. **Collect** — gather all results with `orchestrator_result`
9. **Synthesize** — summarize outcomes, flag failures, report total cost
