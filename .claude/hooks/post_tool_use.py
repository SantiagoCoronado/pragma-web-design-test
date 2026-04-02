#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import json
import os
import sys
from datetime import datetime
from pathlib import Path


def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Ensure log directory exists
        log_dir = Path.cwd() / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / "post_tool_use.json"

        # Read existing log data or initialize empty list
        if log_path.exists():
            with open(log_path, "r") as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []

        # Append new data with timestamp
        input_data["timestamp"] = datetime.now().isoformat()
        log_data.append(input_data)

        # Write back to file with formatting
        with open(log_path, "w") as f:
            json.dump(log_data, f, indent=2)

        # Emit trace event for observatory
        try:
            tool_name = input_data.get("tool_name", "unknown")
            tool_input = input_data.get("tool_input", {})
            trace_dir = Path.home() / ".claude" / "traces"
            trace_dir.mkdir(parents=True, exist_ok=True)
            trace_file = trace_dir / "events.jsonl"

            # Determine event detail based on tool type
            detail = ""
            event_type = "tool_called"
            if tool_name in ("Read", "Glob", "Grep"):
                path = tool_input.get("file_path", tool_input.get("path", tool_input.get("pattern", "")))
                detail = str(path).split("/")[-2:] if "/" in str(path) else str(path)
                detail = "/".join(detail) if isinstance(detail, list) else detail
                event_type = "file_accessed"
            elif tool_name in ("Edit", "Write", "MultiEdit"):
                path = tool_input.get("file_path", "")
                detail = str(path).split("/")[-2:] if "/" in str(path) else str(path)
                detail = "/".join(detail) if isinstance(detail, list) else detail
                event_type = "file_accessed"
            elif tool_name == "Bash":
                cmd = tool_input.get("command", "")
                detail = cmd[:80]
            elif tool_name == "Agent":
                detail = tool_input.get("description", tool_input.get("prompt", ""))[:60]
                event_type = "agent_spawned"
            elif tool_name == "Skill":
                detail = tool_input.get("skill", "")
                event_type = "skill_invoked"

            trace_event = {
                "ts": datetime.now().isoformat(),
                "type": event_type,
                "trace_id": os.environ.get("CLAUDE_SESSION_ID", "unknown"),
                "parent_id": os.environ.get("CLAUDE_PARENT_SESSION_ID"),
                "agent": os.environ.get("CLAUDE_AGENT_NAME", "main"),
                "cwd": str(Path.cwd()),
                "data": {
                    "tool": tool_name,
                    "detail": str(detail),
                    "path": tool_input.get("file_path", tool_input.get("path", "")),
                    "action": "write" if tool_name in ("Edit", "Write", "MultiEdit") else "read",
                },
            }
            with open(trace_file, "a") as f:
                f.write(json.dumps(trace_event) + "\n")
        except Exception:
            pass  # Never let tracing break the hook

        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Exit cleanly on any other error
        sys.exit(0)


if __name__ == "__main__":
    main()
