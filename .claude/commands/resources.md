---
description: Show system resource status and throttle score
---
Show current system resources and the adaptive throttle score.

Run the throttle diagnostic:

!`uv run --no-project ~/.claude/hooks/utils/throttle.py --status`

Then interpret the results:
- **Score 0.0-0.25**: Green — full speed, no constraints
- **Score 0.25-0.45**: Warm — moderate throttle, using Sonnet
- **Score 0.45-0.65**: Hot — significant throttle, P1-P5 tasks only
- **Score 0.65-0.85**: Throttled — minimal work, Haiku only, P1-P3
- **Score 0.85-1.0**: Stopped — don't chain, pause the queue

If the dominant constraint is `battery`, suggest plugging in. If `thermal`, suggest waiting. If `api`, show estimated remaining budget. If `memory`, suggest closing applications.
