---
description: Launch the Agent Observatory — real-time visualization of agent trees, tool calls, file access, and throttle state
---
Launch the Agent Observatory dashboard.

Start the observatory server:
```bash
uv run --no-project ~/.claude/hooks/utils/trace.py --serve --port 7777
```

Then open `http://localhost:7777` in a browser.

The dashboard shows:
- **Agent tree**: who spawned who, status (active/completed/failed), duration
- **Tool calls**: what each agent is doing in real-time
- **File access**: which files each agent reads/writes
- **Throttle**: live resource status (die temp, battery, memory, API budget)
- **Live feed**: scrolling event stream of all agent activity

To see recent trace events in the terminal instead:
```bash
uv run --no-project ~/.claude/hooks/utils/trace.py --tail 30
```

To clear traces and start fresh:
```bash
uv run --no-project ~/.claude/hooks/utils/trace.py --clear
```
