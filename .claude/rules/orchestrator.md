# Orchestrator Safety Rules

These rules apply when operating in autonomous orchestrator mode (processing tasks from the Obsidian queue).

## Session limits
- Maximum 10 sessions per orchestrator run (override with `ORCHESTRATOR_MAX_SESSIONS` env var)
- Each session processes exactly one task — no multi-task sessions
- If a task takes more than the full session context, commit WIP and mark it for resumption

## Prohibited actions
- NEVER force push (`git push --force`, `git push -f`)
- NEVER deploy to production
- NEVER run destructive database migrations (`DROP TABLE`, `DELETE FROM` without WHERE)
- NEVER modify CI/CD pipelines without explicit task approval
- NEVER delete branches that aren't your own feature branches
- NEVER commit secrets, tokens, or credentials

## Failure handling
- If tests fail twice on the same task, mark it `failed` and skip to the next task
- Always commit work-in-progress before ending a session — never discard partial work
- If a task's repo doesn't exist locally, skip it and log the reason
- If a task is ambiguous or missing acceptance criteria, skip it and add a note explaining why

## Vault writes
- Always write results back to the vault before chaining to the next session
- Update the task's session log with what was done, even on failure
- Append to the daily note after each task completion

## Adaptive throttle
- The throttle score (0.0-1.0) is injected into session context at startup — READ IT
- Respect the model tier recommendation: if throttle says "sonnet", do NOT use opus
- Respect the priority cutoff: if throttle says P1-P3, skip P4+ tasks even if they're next in queue
- If throttle score > 0.65, prefer lighter approaches (direct fixes over elaborate plans)
- If throttle score > 0.85, the stop hook will pause chaining — do not try to override this
- Run `/resources` if you suspect the system is under pressure before starting heavy work
- Use the `resource-monitor` agent (Haiku) to check system health before expensive operations

## Cost awareness
- Use `the-chief` agent (Haiku) for triage — don't use expensive models for assessment
- For simple tasks (score 3-5), implement directly without elaborate planning
- Track estimated cost in the task's `cost_usd` frontmatter field when possible
- The throttle tracks API budget pacing — if burn rate exceeds 1.5x sustainable, it triggers throttling
- When throttled for API budget, prefer Haiku for all non-critical work
