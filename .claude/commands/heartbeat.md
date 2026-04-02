---
description: Full orchestrator status report — Paperclip-style heartbeat showing health, queue, budget, and thermal trajectory
---
Show the full orchestrator heartbeat status.

## Collect Data

1. Run throttle diagnostic:
!`uv run --no-project ~/.claude/hooks/utils/throttle.py --json`

2. Check die temperatures if available:
!`swift ~/.claude/hooks/utils/thermal_sensor.swift --json 2>/dev/null || echo '{"avg_die_temp": null}'`

3. Read queue status from vault:
!`ls ~/Documents/Vaults/boldorigins/Claude/Active/*.md 2>/dev/null | wc -l`
!`ls ~/Documents/Vaults/boldorigins/Claude/Queue/*.md 2>/dev/null | wc -l`
!`ls ~/Documents/Vaults/boldorigins/Claude/Done/*.md 2>/dev/null | wc -l`
!`ls ~/Documents/Vaults/boldorigins/Claude/Inbox/*.md 2>/dev/null | wc -l`

4. Check today's session count:
!`cat ~/.claude/orchestrator-session-count 2>/dev/null || echo "0"`

5. Read throttle trend history:
!`cat ~/.claude/throttle-state.json 2>/dev/null`

## Format as Heartbeat Report

```
╔══════════════════════════════════════════════╗
║           ORCHESTRATOR HEARTBEAT             ║
║           [timestamp]                        ║
╠══════════════════════════════════════════════╣
║  Health:    [GREEN/YELLOW/ORANGE/RED]        ║
║  Score:     0.XX (dominant constraint)       ║
║  Model:     opus/sonnet/haiku                ║
╠══════════════════════════════════════════════╣
║  THERMAL                                    ║
║  Die avg:   XX.X°C  (trend: rising/stable)  ║
║  Throttle:  Great/Fair/Serious/Critical      ║
║  Battery:   XX% (charging/discharging)      ║
╠══════════════════════════════════════════════╣
║  QUEUE                                      ║
║  Active:    X tasks                         ║
║  Queued:    X tasks                         ║
║  Done:      X tasks (today)                 ║
║  Inbox:     X tasks                         ║
╠══════════════════════════════════════════════╣
║  BUDGET                                     ║
║  Sessions today:  X / 10 max                ║
║  Est. messages:   ~XXX / 900                ║
║  Burn rate:       X.Xx sustainable          ║
╠══════════════════════════════════════════════╣
║  TREND (last 8 readings)                    ║
║  Temp:  ▁▂▃▃▄▅▆▇  (rising +2.1°C)         ║
║  Mem:   ▅▅▅▅▅▅▅▅  (stable)                 ║
╚══════════════════════════════════════════════╝
```

Use Unicode block characters (▁▂▃▄▅▆▇█) to visualize trends from the throttle-state.json history.

Color the health status:
- GREEN (score < 0.25): "All systems nominal"
- YELLOW (score 0.25-0.45): "Light throttle active"
- ORANGE (score 0.45-0.65): "Moderate throttle — reduced capacity"
- RED (score > 0.65): "Heavy throttle — critical constraints"
