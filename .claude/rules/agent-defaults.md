# Agent Defaults

These rules apply to every agent in the system — main session, sub-agents, and team members.

## Always use sub-agents for independent work

When you have 2+ independent subtasks (different files, different modules, different concerns):
- **Spawn sub-agents** using the `Agent` tool — don't do them sequentially
- Use `isolation: "worktree"` when agents will write code — prevents git conflicts
- Use `run_in_background: true` when you have other work to do while they run
- Launch multiple agents in a **single message** for true concurrency

```
# Good: 3 independent research tasks → 3 parallel agents
Agent(prompt="Research X", run_in_background=true)
Agent(prompt="Research Y", run_in_background=true)
Agent(prompt="Research Z", run_in_background=true)

# Bad: doing them one at a time
```

## Always bootstrap

Every agent — whether main session, sub-agent, or team member — follows the bootstrap protocol:
1. Detect stack (what languages/frameworks am I working with?)
2. Load best practices from `Claude/Knowledge/best-practices/`
3. Load domain knowledge if task involves regulated areas
4. Read project CLAUDE.md for local conventions

Sub-agents can skip bootstrap for trivial tasks (pure file reads, searches).

## Agent teams for complex tasks

When a task scores 9-12 on complexity AND has decomposable subtasks:
- Use `TeamCreate` to spawn a team if available
- Or use multiple `Agent` calls with `isolation: "worktree"`
- Lead agent coordinates, teammates execute independently
- Each teammate bootstraps independently

## Model selection per agent

Match the model to what the agent needs to do:
- `model: haiku` — triage, search, status checks, simple reads
- `model: sonnet` — standard implementation, moderate reasoning
- `model: opus` — complex architecture, novel algorithms, specs

Don't override the model router's recommendation unless you have a specific reason.

## Trace everything

All agents emit trace events automatically via hooks. But when spawning sub-agents:
- Set `CLAUDE_AGENT_NAME` env var so traces show meaningful names
- Set `CLAUDE_PARENT_SESSION_ID` so the observatory can build the tree

## Report results concisely

Sub-agents return their results to the parent. Keep results:
- Structured (what was done, what changed, what failed)
- Concise (the parent doesn't need your thought process)
- Actionable (if something needs follow-up, say so clearly)

## Available agents

Use existing specialized agents when they fit:
- `the-chief` (haiku) — complexity assessment
- `researcher` (haiku) — read-only codebase exploration
- `code-reviewer` (sonnet) — review diffs for issues
- `debugger` (sonnet) — root cause analysis + fix
- `resource-monitor` (haiku) — system health check
- `dispatcher` (sonnet) — multi-repo task dispatch
- `meta-agent` (opus) — create new agent definitions
- `meta-skill` (opus) — create new skill definitions

Or spawn general-purpose sub-agents for one-off tasks.
