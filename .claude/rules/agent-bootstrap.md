# Agent Bootstrap Protocol

Every agent MUST follow this protocol before starting work. No exceptions. This is what makes agents self-sufficient and capable of running independently at scale.

## The Bootstrap Sequence

Before writing a single line of code, execute these steps:

### 1. Detect context
- What project am I in? Read CLAUDE.md, package.json, go.mod, Cargo.toml
- What languages/frameworks are involved in THIS task?
- What domain does this touch? (fiscal, financial, auth, etc.)

### 2. Load best practices
Check `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/best-practices/` for:
- Language best practices (e.g., `go.md`, `typescript.md`, `python.md`)
- Framework best practices (e.g., `next-js.md`, `gorm.md`, `react.md`)
- Domain best practices (e.g., `fiscal-mexico.md`, `api-design.md`)

**If a best practices file doesn't exist — CREATE IT.** Research current best practices via WebSearch, write them to the vault, then load them. You are building the knowledge base as you work.

### 3. Load project knowledge
Check `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/` for:
- Project knowledge graph (`<project>-graph.md`)
- Domain research relevant to the task

If the knowledge graph doesn't exist or is stale (>30 days), note this but don't block — proceed with what's available.

### 4. Load project-specific rules
Read the project's CLAUDE.md for conventions, patterns, and gotchas. These override global best practices when they conflict.

### 5. Announce readiness
After bootstrapping, you should know:
- What language(s) you're writing
- What best practices apply
- What domain rules constrain you
- What the codebase looks like (if graph exists)
- What tests are expected

## Best Practices File Format

When creating best practices, use this format:

```markdown
---
language: go
frameworks: [gorm, chi, atlas]
updated: 2026-03-31
sources: [effective-go, go-wiki, project-experience]
---

# Go Best Practices

## Error Handling
- Always wrap errors with context: `fmt.Errorf("operation failed: %w", err)`
- ...

## Testing
- Table-driven tests for all public functions
- ...

## Project-Specific
- (Added by agents who worked in this project)
- ...
```

## Self-Improvement

After completing a task, check:
- Did I discover a pattern worth capturing as a best practice? → Update the best practices file
- Did I create a reusable approach worth sharing? → Create a new skill via `/learn`
- Did I find a gotcha or pitfall? → Add it to the best practices file
- Did I find that a best practice was wrong or outdated? → Update it

## Why This Matters

When 50+ agents run in parallel, each must be an expert immediately. They can't ask each other questions. They can't wait for context. The bootstrap protocol ensures every agent starts with the accumulated knowledge of all previous agents.
