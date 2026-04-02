---
name: bootstrap
description: Bootstrap an agent with context, best practices, and domain knowledge for the current task. Run this automatically before starting any work. Creates missing best practices files on the fly.
model: haiku
---

Bootstrap this agent for the current task.

$ARGUMENTS

## Instructions

### Step 1: Detect stack

Scan the current project for technology markers:
- `go.mod` → Go
- `package.json` → Node.js/TypeScript (check for `next`, `react`, `vue`, etc.)
- `Cargo.toml` → Rust
- `pyproject.toml` / `setup.py` / `requirements.txt` → Python
- `Gemfile` → Ruby
- `*.swift` / `Package.swift` → Swift

List all detected languages and frameworks.

### Step 2: Load or create best practices

For each detected technology, check `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/best-practices/<tech>.md`:

**If it exists**: Read it and internalize the key rules.

**If it doesn't exist**: Create it by:
1. Use WebSearch to find current best practices for that technology
2. Synthesize into a concise, actionable guide (not a tutorial — rules and patterns)
3. Write to `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/best-practices/<tech>.md`
4. Include: error handling, testing, naming, architecture, common pitfalls, security

### Step 3: Load project context

Read from `$OBSIDIAN_VAULT_PATH/Claude/`:
- `Projects/<project>.md` — domain, stack, compliance requirements
- `Knowledge/<project>-graph.md` — codebase structure (if exists)
- Any domain research files relevant to the current task

### Step 4: Load project-specific overrides

Read the project's CLAUDE.md. Project conventions override global best practices.

### Step 5: Output bootstrap summary

Print a concise summary:
```
BOOTSTRAP COMPLETE
  Stack: Go 1.25, GORM v2, PostgreSQL 18, Atlas migrations
  Best practices loaded: go.md, gorm.md, api-design.md
  Domain: fiscal (Mexico) — SAT compliance required
  Knowledge graph: available (mapped 2026-03-28)
  Project rules: 12 conventions from CLAUDE.md
  Ready to execute.
```

This output becomes part of the agent's context for the task.
