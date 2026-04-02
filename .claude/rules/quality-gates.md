# Quality Gates

Safety net rules that apply to ALL orchestrator work. These catch common model weaknesses before they ship.

## Test enforcement
- If you changed code files (.py, .js, .ts, .go, .rs, .java, .rb, .swift), you MUST also write or update tests
- Exception: config files, documentation, CI/CD, and refactors that don't change behavior
- If the project has no test framework, note this in the session log rather than skipping
- Run tests before committing. If tests fail, fix them. Do NOT commit failing tests.
- If tests fail twice on the same issue, mark the task as failed rather than shipping broken code

## Pre-commit verification
Before every commit, verify:
1. All changed files actually exist (catch hallucinated file paths)
2. All imported modules exist (catch hallucinated imports)
3. Code compiles/parses without syntax errors
4. Tests pass (if test framework exists)
5. No secrets, tokens, or credentials in the diff

## Hallucination guards
You are prone to these specific failure modes — actively check for them:
- **Invented APIs**: Before calling a function/method, verify it exists in the codebase or docs. Don't assume a library has a method just because the name sounds right.
- **Phantom files**: Before importing or reading a file, verify it exists with `ls` or `Glob`. Don't reference files you haven't confirmed.
- **Wrong versions**: Don't assume package versions or features. Check `package.json`, `go.mod`, `Cargo.toml` for actual installed versions.
- **Stale knowledge**: Your training data has a cutoff. For recent APIs, frameworks, or tools, verify against actual docs or source code rather than relying on memory.
- **Confident but wrong**: If you're unsure about something, say so. Expressing false confidence is worse than admitting uncertainty.

## Self-review checklist
Before marking a task as done, mentally review:
- [ ] Does the change actually address the task description?
- [ ] Are there edge cases I haven't considered?
- [ ] Did I introduce any regressions?
- [ ] Would a human reviewer flag anything?
- [ ] Is the change minimal — no unnecessary refactoring or scope creep?

## Metrics recording
After completing each task, record metrics by running:
```bash
uv run --no-project ~/.claude/hooks/utils/metrics.py --measure-changes
```
Include the results in the task's frontmatter (`lines_added`, `files_changed`, `has_tests`).

## Model weakness awareness
- **Haiku**: Fast but shallow. Good for: triage, simple edits, status checks. Bad for: complex refactors, multi-file changes, architectural decisions.
- **Sonnet**: Balanced. Good for: most tasks, moderate complexity. Bad for: novel algorithms, ambiguous specs.
- **Opus**: Deep but expensive. Good for: complex tasks, specs, multi-step reasoning. Bad for: simple tasks where it overcomplicates.

Match the model to the task. Don't use Opus for a one-line fix. Don't use Haiku for a 9-file refactor.
