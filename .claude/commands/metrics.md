---
description: Show orchestrator metrics dashboard — tasks, code, tests, quality gates, model usage, and cost
---
Show the orchestrator metrics dashboard.

## Collect Data

1. Run metrics dashboard:
!`uv run --no-project ~/.claude/hooks/utils/metrics.py --dashboard`

2. Get JSON for detailed analysis:
!`uv run --no-project ~/.claude/hooks/utils/metrics.py --json --days 30`

## Interpret Results

Present the dashboard with commentary:

**Tasks** — Success rate should be >85%. If failed tasks are high, check the session logs in `Done/` for patterns. Common causes: ambiguous specs, missing dependencies, test failures.

**Code** — Net lines is a vanity metric. What matters: are the right files changing? Is scope creeping?

**Testing** — "Code w/o tests" is the key quality signal. If this number is rising, the quality gates aren't catching enough. Every code task should produce or update tests.

**Quality Gates** — Blocks = times the quality gate prevented a bad commit. Hallucinations caught = times a reference was verified and found to not exist. Self-review fixes = times the self-review step caught an issue. Higher numbers here mean the safety net is working.

**Model Usage** — Distribution should match task complexity. If Opus is being used for simple tasks, the router needs tuning. If Haiku is failing on moderate tasks, complexity assessment needs recalibration.

**Cost** — Track trend over time. Cost per completed task is the unit metric to optimize.

If the user asks for a specific period, re-run with `--days N`.
