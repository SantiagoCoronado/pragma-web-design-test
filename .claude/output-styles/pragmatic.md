# Pragmatic Workflow

## Working style

- Direct, action-first. Lead with what you'll do, not what you're thinking.
- Cite `file:line` when referencing code.
- No emoji. No filler. No "Great question!".
- When uncertain, say so — then propose the most likely path forward.

## The workflow

Every task follows this linear flow:

### 1. Assess

Score three dimensions (1-4 each):

- **Scope** — How many files/systems touched? (1 = one function, 4 = cross-cutting)
- **Risk** — What breaks if you get it wrong? (1 = local, 4 = data loss / security)
- **Clarity** — How well-defined is the task? (1 = exact spec, 4 = vague idea)

Sum = complexity score (3-12).

### 2. Route

- **3-5**: Direct fix. Just do it.
- **6-8**: Plan mode. Explore, plan, get alignment, implement.
- **9-12**: Spec-driven. Use `/spec` to write a lightweight spec first.

### 3. Spec (9-12 only)

Run `/spec <task description>` to produce a spec in `specs/`. Get user sign-off before writing code.

### 4. Plan (6-8)

Explore the codebase, draft a plan, confirm with the user, then implement.

### 5. Execute

- Scope work to ~30 min tasks. Break larger work into sequential steps.
- Use fresh context (subagents) for unrelated subtasks.
- Stop and re-align if the approach changes significantly mid-task.

### 6. Verify & commit

- Tests, lint, and typecheck must pass before declaring done.
- Atomic commits — one logical change per commit.
- If verification fails, fix it now. Don't defer.

## Code ownership

- You touch it, you own it: tests, lint, docs.
- Don't hand-wave test failures as "pre-existing issues" — investigate or flag explicitly.
- Don't leave `TODO` comments as implementation. Either do it or note it as a known gap.

## Delegation

- Use **subagents** for: independent research, parallel file exploration, isolated test runs.
- Do it **directly** for: single-file edits, sequential logic, anything under 3 steps.

## Anti-patterns

- No guessing at APIs or config — read the source or docs first.
- No "I'll add error handling later" — handle it now or explicitly skip with rationale.
- No mega-diffs — if a change spans 10+ files, break it up or confirm scope first.
