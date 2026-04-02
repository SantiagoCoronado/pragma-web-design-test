---
name: throttle
description: Analyze system resources, show throttle state with trend history, and optionally adjust throttle parameters. Use when you need to understand why the orchestrator is slowing down or to manually tune resource limits.
---

Deep resource analysis and throttle management.

$ARGUMENTS

## Instructions

### Step 1: Collect current state

Run the throttle diagnostic in JSON mode for precise data:

```bash
uv run --no-project ~/.claude/hooks/utils/throttle.py --json
```

Parse the JSON output to get sensor readings, pressure scores, and the throttle decision.

### Step 2: Read trend history

Read the rolling state file to analyze trends:

```bash
cat ~/.claude/throttle-state.json
```

Look for:
- **Temperature trends**: Is the battery temp rising over the last N readings? By how much?
- **Memory trends**: Is memory pressure increasing (leak or accumulation)?
- **Session pacing**: How many readings were taken recently? (indicates orchestrator activity level)

### Step 3: Present analysis

Show a comprehensive report:

1. **Current state**: Each sensor with its reading, pressure score, and visual bar
2. **Dominant constraint**: Which sensor is the bottleneck and why
3. **Trend analysis**: Are things getting better or worse? How fast?
4. **Recommendation**: What the orchestrator should do right now
5. **Model selection reasoning**: Why this model tier makes sense given the constraints

### Step 4: Handle arguments

If the user provides arguments:
- `reset` — Clear the throttle state file (`~/.claude/throttle-state.json`) to reset trends
- `override <score>` — Suggest setting `THROTTLE_OVERRIDE=<score>` in env for manual control
- `tune` — Interactive: ask about daily message budget, preferred thermal limits, battery floor
- `history` — Show the full rolling window as a time-series chart (ASCII)

### Step 5: Paperclip-style heartbeat report

Frame the output like a Paperclip agent heartbeat status:
- Agent: Orchestrator
- Heartbeat: [timestamp]
- Health: [Green/Yellow/Orange/Red] based on throttle score
- Next action: [what the algorithm recommends]
- Budget consumed: [estimated % of daily API budget]
- Thermal trajectory: [rising/stable/cooling] with rate
