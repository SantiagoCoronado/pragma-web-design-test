#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Stop hook: summarize and optionally cancel running orchestrated sessions.

Reads session state from ~/.claude/orchestrator/sessions/ and logs a summary.
Does NOT cancel sessions by default — they may be intentionally long-running.
Set ORCHESTRATOR_CANCEL_ON_EXIT=1 to auto-cancel.
"""

import json
import os
import signal
import sys
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".claude" / "orchestrator" / "sessions"


def pid_alive(pid: int) -> bool:
    if not pid:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def main() -> None:
    # Drain stdin (Stop hook provides JSON but we don't need it)
    try:
        json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        pass

    if not STATE_DIR.exists():
        return

    running = []
    for meta_file in STATE_DIR.glob("*.meta.json"):
        try:
            with open(meta_file) as f:
                meta = json.load(f)
            if meta.get("status") in ("running", "queued", "starting"):
                pid = meta.get("pid")
                if pid and pid_alive(pid):
                    running.append(meta)
        except (json.JSONDecodeError, OSError):
            continue

    if not running:
        return

    # Log summary to stderr (visible in debug mode)
    names = [m.get("name", m["session_id"]) for m in running]
    sys.stderr.write(
        f"[orchestrator] {len(running)} session(s) still running: "
        f"{', '.join(names)}\n"
    )

    # Auto-cancel if configured
    if os.environ.get("ORCHESTRATOR_CANCEL_ON_EXIT") == "1":
        for meta in running:
            pid = meta.get("pid")
            if pid and pid_alive(pid):
                try:
                    os.kill(pid, signal.SIGTERM)
                    sys.stderr.write(
                        f"[orchestrator] Sent SIGTERM to {meta.get('name', meta['session_id'])} (PID {pid})\n"
                    )
                except OSError:
                    pass
            # Update meta
            meta["status"] = "cancelled"
            meta["ended_at"] = datetime.now().isoformat()
            meta["error"] = "Cancelled by session exit hook"
            meta_path = STATE_DIR / f"{meta['session_id']}.meta.json"
            with open(meta_path, "w") as f:
                json.dump(meta, f, indent=2)
        sys.stderr.write(f"[orchestrator] Cancelled {len(running)} session(s)\n")


if __name__ == "__main__":
    main()
