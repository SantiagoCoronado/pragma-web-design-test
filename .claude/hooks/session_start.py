#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
#     "pyyaml",
# ]
# ///

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def log_session_start(input_data):
    """Log session start event to logs directory."""
    # Ensure logs directory exists
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "session_start.json"

    # Read existing log data or initialize empty list
    if log_file.exists():
        with open(log_file, "r") as f:
            try:
                log_data = json.load(f)
            except (json.JSONDecodeError, ValueError):
                log_data = []
    else:
        log_data = []

    # Append the entire input data with timestamp
    input_data["timestamp"] = datetime.now().isoformat()
    log_data.append(input_data)

    # Write back to file with formatting
    with open(log_file, "w") as f:
        json.dump(log_data, f, indent=2)


def get_git_status():
    """Get current git status information."""
    try:
        # Get current branch
        branch_result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        current_branch = (
            branch_result.stdout.strip() if branch_result.returncode == 0 else "unknown"
        )

        # Get uncommitted changes count
        status_result = subprocess.run(
            ["git", "status", "--porcelain"], capture_output=True, text=True, timeout=5
        )
        if status_result.returncode == 0:
            changes = (
                status_result.stdout.strip().split("\n") if status_result.stdout.strip() else []
            )
            uncommitted_count = len(changes)
        else:
            uncommitted_count = 0

        return current_branch, uncommitted_count
    except Exception:
        return None, None


def get_recent_issues():
    """Get recent GitHub issues if gh CLI is available."""
    try:
        # Check if gh is available
        gh_check = subprocess.run(["which", "gh"], capture_output=True)
        if gh_check.returncode != 0:
            return None

        # Get recent open issues
        result = subprocess.run(
            ["gh", "issue", "list", "--limit", "5", "--state", "open"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception:
        pass
    return None


def load_obsidian_queue():
    """Load task queue context from Obsidian vault."""
    try:
        import os

        vault_path = Path(
            os.environ.get("OBSIDIAN_VAULT_PATH", os.path.expanduser("~/Documents/Vaults/boldorigins"))
        )
        claude_dir = vault_path / "Claude"
        if not claude_dir.exists():
            return None

        parts = []

        # Check active tasks
        active_dir = claude_dir / "Active"
        if active_dir.exists():
            for f in sorted(active_dir.glob("*.md")):
                fm = _parse_task_frontmatter(f)
                if fm:
                    parts.append(f"  [ACTIVE] {fm.get('title', f.stem)} (P{fm.get('priority', '?')}, started {fm.get('started', '?')})")

        # Check queued tasks (top 5)
        queue_dir = claude_dir / "Queue"
        if queue_dir.exists():
            tasks = []
            for f in sorted(queue_dir.glob("*.md")):
                fm = _parse_task_frontmatter(f)
                if fm:
                    tasks.append((f, fm))
            tasks.sort(key=lambda t: (t[1].get("priority", 5), t[1].get("created", "")))
            for f, fm in tasks[:5]:
                parts.append(f"  [QUEUE]  {fm.get('title', f.stem)} (P{fm.get('priority', '?')}, {fm.get('type', '?')})")

        if not parts:
            return None

        return "--- Obsidian Task Queue ---\n" + "\n".join(parts)

    except Exception:
        return None


def _parse_task_frontmatter(path):
    """Parse YAML frontmatter from a markdown task file."""
    try:
        import yaml

        text = path.read_text(encoding="utf-8")
        match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
        if not match:
            return None
        return yaml.safe_load(match.group(1)) or {}
    except Exception:
        return None


def load_throttle_status():
    """Load throttle state for context injection."""
    try:
        import os

        throttle_script = os.path.expanduser("~/.claude/hooks/utils/throttle.py")
        if not os.path.exists(throttle_script):
            return None

        result = subprocess.run(
            ["uv", "run", "--no-project", throttle_script, "--json"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode != 0:
            return None

        decision = json.loads(result.stdout)
        score = decision.get("score", 0)
        model = decision.get("model", "opus")
        dominant = decision.get("dominant_constraint", "none")
        delay = decision.get("delay_seconds", 0)
        should_stop = decision.get("should_stop", False)

        readings = decision.get("readings", {})
        batt = readings.get("battery_pct", "?")
        charging = "plugged in" if readings.get("is_charging") else "battery"
        thermal = readings.get("thermal_level", "?")
        mem = readings.get("memory_pct", "?")

        status = "PAUSED" if should_stop else f"{model} | {delay}s delay"
        lines = [
            "--- Resource Throttle ---",
            f"  Score: {score:.2f} ({dominant}) → {status}",
            f"  Thermal: {thermal} | Battery: {batt}% ({charging}) | Memory: {mem}%",
        ]
        if score > 0.3:
            lines.append(f"  NOTE: Throttle active — use {model} model, respect {delay}s delay between tasks")

        return "\n".join(lines)

    except Exception:
        return None


def load_development_context(source):
    """Load relevant development context based on session source."""
    context_parts = []

    # Add timestamp
    context_parts.append(f"Session started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    context_parts.append(f"Session source: {source}")

    # Add git information
    branch, changes = get_git_status()
    if branch:
        context_parts.append(f"Git branch: {branch}")
        if changes > 0:
            context_parts.append(f"Uncommitted changes: {changes} files")

    # Load project-specific context files if they exist
    context_files = [
        ".claude/CONTEXT.md",
        ".claude/TODO.md",
        "TODO.md",
        ".github/ISSUE_TEMPLATE.md",
    ]

    for file_path in context_files:
        if Path(file_path).exists():
            try:
                with open(file_path, "r") as f:
                    content = f.read().strip()
                    if content:
                        context_parts.append(f"\n--- Content from {file_path} ---")
                        context_parts.append(content[:1000])  # Limit to first 1000 chars
            except Exception:
                pass

    # Add recent issues if available
    issues = get_recent_issues()
    if issues:
        context_parts.append("\n--- Recent GitHub Issues ---")
        context_parts.append(issues)

    # Add Obsidian task queue context
    queue_context = load_obsidian_queue()
    if queue_context:
        context_parts.append(f"\n{queue_context}")

    # Add throttle status if in orchestrator mode
    throttle_context = load_throttle_status()
    if throttle_context:
        context_parts.append(f"\n{throttle_context}")

    return "\n".join(context_parts)


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument(
            "--load-context",
            action="store_true",
            help="Load development context at session start",
        )
        parser.add_argument(
            "--announce", action="store_true", help="Announce session start via TTS"
        )
        args = parser.parse_args()

        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())

        # Extract fields
        source = input_data.get("source", "unknown")  # "startup", "resume", or "clear"

        # Log the session start event
        log_session_start(input_data)

        # Emit trace event for observatory
        try:
            import os
            trace_dir = Path.home() / ".claude" / "traces"
            trace_dir.mkdir(parents=True, exist_ok=True)
            trace_file = trace_dir / "events.jsonl"
            trace_event = {
                "ts": datetime.now().isoformat(),
                "type": "agent_spawned",
                "trace_id": os.environ.get("CLAUDE_SESSION_ID", "unknown"),
                "parent_id": os.environ.get("CLAUDE_PARENT_SESSION_ID"),
                "agent": os.environ.get("CLAUDE_AGENT_NAME", "main"),
                "cwd": str(Path.cwd()),
                "data": {"detail": f"Session {source}", "source": source},
            }
            with open(trace_file, "a") as tf:
                tf.write(json.dumps(trace_event) + "\n")
        except Exception:
            pass

        # Load development context if requested
        if args.load_context:
            context = load_development_context(source)
            if context:
                # Using JSON output to add context
                output = {
                    "hookSpecificOutput": {
                        "hookEventName": "SessionStart",
                        "additionalContext": context,
                    }
                }
                print(json.dumps(output))
                sys.exit(0)

        # Announce session start if requested
        if args.announce:
            try:
                # Try to use TTS to announce session start
                script_dir = Path(__file__).parent
                tts_script = script_dir / "utils" / "tts" / "pyttsx3_tts.py"

                if tts_script.exists():
                    messages = {
                        "startup": "Claude Code session started",
                        "resume": "Resuming previous session",
                        "clear": "Starting fresh session",
                    }
                    message = messages.get(source, "Session started")

                    subprocess.run(
                        ["uv", "run", str(tts_script), message],
                        capture_output=True,
                        timeout=5,
                    )
            except Exception:
                pass

        # Success
        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == "__main__":
    main()
