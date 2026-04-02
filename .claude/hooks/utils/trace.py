#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Agent trace event system for the observatory.

Logs structured events with parent-child relationships for tree visualization.
Every agent action becomes a trace event. Events are appended to a JSONL file
that the dashboard reads in real-time.

Event types:
  - dispatch_start/end     — root dispatcher lifecycle
  - agent_spawned          — new agent created (with parent ID)
  - agent_completed/failed — agent finished
  - bootstrap_start/end    — agent bootstrapping
  - task_claimed/completed/failed — task lifecycle
  - tool_called            — any tool invocation (Read, Edit, Bash, etc.)
  - file_accessed          — file read or written
  - skill_invoked          — skill triggered
  - research_started/found — domain research
  - learn_captured         — new skill/rule created by agent
  - throttle_checked       — resource check result

Usage:
    from utils.trace import emit, new_trace_id

    trace_id = new_trace_id()
    emit("agent_spawned", trace_id=trace_id, parent_id=parent, data={...})
"""

import argparse
import json
import os
import uuid
from datetime import datetime

TRACE_FILE = os.path.expanduser("~/.claude/traces/events.jsonl")
TRACE_DIR = os.path.dirname(TRACE_FILE)


def new_trace_id() -> str:
    """Generate a short unique trace ID."""
    return uuid.uuid4().hex[:12]


def emit(
    event_type: str,
    trace_id: str | None = None,
    parent_id: str | None = None,
    agent_name: str | None = None,
    data: dict | None = None,
) -> dict:
    """Emit a trace event to the JSONL log.

    Args:
        event_type: One of the defined event types
        trace_id: Unique ID for this agent/trace (auto-generated if None)
        parent_id: trace_id of the parent agent (None for root)
        agent_name: Human-readable agent name
        data: Event-specific payload
    """
    if trace_id is None:
        trace_id = new_trace_id()

    event = {
        "ts": datetime.now().isoformat(),
        "type": event_type,
        "trace_id": trace_id,
        "parent_id": parent_id,
        "agent": agent_name or os.environ.get("CLAUDE_AGENT_NAME", "unknown"),
        "cwd": os.getcwd(),
        "data": data or {},
    }

    try:
        os.makedirs(TRACE_DIR, exist_ok=True)
        with open(TRACE_FILE, "a") as f:
            f.write(json.dumps(event) + "\n")
    except OSError:
        pass

    return event


def read_events(since: str | None = None, limit: int = 500) -> list[dict]:
    """Read trace events from the JSONL log.

    Args:
        since: ISO timestamp — only return events after this time
        limit: Max events to return (from the end)
    """
    events = []
    try:
        if not os.path.exists(TRACE_FILE):
            return []
        with open(TRACE_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    event = json.loads(line)
                    if since and event.get("ts", "") < since:
                        continue
                    events.append(event)
                except json.JSONDecodeError:
                    continue
    except OSError:
        pass
    return events[-limit:]


def build_tree(events: list[dict]) -> dict:
    """Build a tree structure from trace events for visualization.

    Returns a dict with:
        nodes: [{id, name, type, status, start, end, children, data}]
        edges: [{from, to, type}]
        stats: {total_agents, active, completed, failed, tools_called, files_accessed}
    """
    nodes = {}
    edges = []
    stats = {
        "total_agents": 0,
        "active": 0,
        "completed": 0,
        "failed": 0,
        "tools_called": 0,
        "files_accessed": 0,
        "skills_invoked": 0,
    }

    for event in events:
        tid = event.get("trace_id")
        etype = event.get("type", "")
        parent = event.get("parent_id")
        data = event.get("data", {})

        if etype in ("dispatch_start", "agent_spawned"):
            nodes[tid] = {
                "id": tid,
                "name": event.get("agent", "unknown"),
                "type": etype.replace("_start", "").replace("_spawned", ""),
                "status": "active",
                "start": event.get("ts"),
                "end": None,
                "children": [],
                "tools": [],
                "files": [],
                "data": data,
            }
            stats["total_agents"] += 1
            stats["active"] += 1
            if parent and parent in nodes:
                nodes[parent]["children"].append(tid)
                edges.append({"from": parent, "to": tid, "type": "spawned"})

        elif etype in ("agent_completed", "dispatch_end"):
            if tid in nodes:
                nodes[tid]["status"] = "completed"
                nodes[tid]["end"] = event.get("ts")
                stats["active"] = max(0, stats["active"] - 1)
                stats["completed"] += 1

        elif etype == "agent_failed":
            if tid in nodes:
                nodes[tid]["status"] = "failed"
                nodes[tid]["end"] = event.get("ts")
                stats["active"] = max(0, stats["active"] - 1)
                stats["failed"] += 1

        elif etype == "tool_called":
            stats["tools_called"] += 1
            if tid in nodes:
                nodes[tid]["tools"].append({
                    "tool": data.get("tool", "unknown"),
                    "ts": event.get("ts"),
                    "detail": data.get("detail", ""),
                })

        elif etype == "file_accessed":
            stats["files_accessed"] += 1
            if tid in nodes:
                nodes[tid]["files"].append({
                    "path": data.get("path", "unknown"),
                    "action": data.get("action", "read"),
                    "ts": event.get("ts"),
                })

        elif etype == "skill_invoked":
            stats["skills_invoked"] += 1

    return {
        "nodes": list(nodes.values()),
        "edges": edges,
        "stats": stats,
    }


def clear_traces() -> None:
    """Clear the trace log (start fresh)."""
    try:
        if os.path.exists(TRACE_FILE):
            os.remove(TRACE_FILE)
    except OSError:
        pass


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Agent trace system")
    parser.add_argument("--emit", type=str, help="Emit event: type:data_json")
    parser.add_argument("--tree", action="store_true", help="Print current tree as JSON")
    parser.add_argument("--tail", type=int, default=20, help="Show last N events")
    parser.add_argument("--clear", action="store_true", help="Clear trace log")
    parser.add_argument("--serve", action="store_true", help="Start HTTP server for dashboard")
    parser.add_argument("--port", type=int, default=7777, help="Server port (default 7777)")
    args = parser.parse_args()

    if args.clear:
        clear_traces()
        print("Traces cleared")
    elif args.emit:
        parts = args.emit.split(":", 1)
        etype = parts[0]
        data = json.loads(parts[1]) if len(parts) > 1 else {}
        event = emit(etype, data=data)
        print(json.dumps(event))
    elif args.tree:
        events = read_events()
        tree = build_tree(events)
        print(json.dumps(tree, indent=2))
    elif args.serve:
        serve_dashboard(args.port)
    else:
        events = read_events(limit=args.tail)
        for e in events:
            ts = e.get("ts", "")[11:19]
            agent = e.get("agent", "?")[:15]
            etype = e.get("type", "?")
            data = e.get("data", {})
            detail = data.get("detail", data.get("tool", data.get("path", "")))
            status_icons = {
                "agent_spawned": "🔵",
                "agent_completed": "✅",
                "agent_failed": "❌",
                "tool_called": "🔧",
                "file_accessed": "📄",
                "task_claimed": "📋",
                "task_completed": "✅",
                "skill_invoked": "⚡",
                "throttle_checked": "🌡️",
                "dispatch_start": "🚀",
                "dispatch_end": "🏁",
                "bootstrap_start": "🔄",
                "bootstrap_end": "✅",
                "learn_captured": "🧠",
            }
            icon = status_icons.get(etype, "•")
            print(f"  {ts} {icon} {agent:15s} {etype:25s} {str(detail)[:50]}")


def serve_dashboard(port: int):
    """Start a simple HTTP server that serves the dashboard and trace API."""
    import http.server
    import threading

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/api/tree":
                events = read_events()
                tree = build_tree(events)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(tree).encode())
            elif self.path == "/api/events":
                events = read_events(limit=100)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(events).encode())
            elif self.path == "/api/throttle":
                try:
                    import subprocess
                    result = subprocess.run(
                        ["uv", "run", "--no-project",
                         os.path.expanduser("~/.claude/hooks/utils/throttle.py"), "--json"],
                        capture_output=True, text=True, timeout=20,
                    )
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(result.stdout.encode())
                except Exception:
                    self.send_response(500)
                    self.end_headers()
            elif self.path == "/" or self.path == "/index.html":
                dashboard_path = os.path.join(
                    os.path.dirname(__file__), "..", "..", "docs", "observatory.html"
                )
                if os.path.exists(dashboard_path):
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html")
                    self.end_headers()
                    with open(dashboard_path, "rb") as f:
                        self.wfile.write(f.read())
                else:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b"Observatory HTML not found")
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, format, *args):
            pass  # Suppress request logging

    server = http.server.HTTPServer(("127.0.0.1", port), Handler)
    print(f"Observatory running at http://localhost:{port}")
    print("Press Ctrl+C to stop")
    server.serve_forever()


if __name__ == "__main__":
    main()
