#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Metrics tracking for the orchestrator.

Tracks per-task and aggregate metrics: lines changed, tests written,
pass rates, model usage, costs, quality gate hits, and session stats.

Persists to ~/.claude/metrics.json as a rolling log (last 500 entries).

Usage:
    # As a module
    from utils.metrics import record_task_metric, get_dashboard

    # As a CLI
    uv run metrics.py --dashboard          # Print dashboard
    uv run metrics.py --json               # JSON stats
    uv run metrics.py --record '{"task_id":"123","lines_changed":42}'
"""

import argparse
import json
import os
import subprocess
from datetime import datetime

METRICS_FILE = os.path.expanduser("~/.claude/metrics.json")
MAX_ENTRIES = 500


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------

def load_metrics() -> list[dict]:
    try:
        if os.path.exists(METRICS_FILE):
            with open(METRICS_FILE, "r") as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return []


def save_metrics(entries: list[dict]) -> None:
    try:
        os.makedirs(os.path.dirname(METRICS_FILE), exist_ok=True)
        with open(METRICS_FILE, "w") as f:
            json.dump(entries[-MAX_ENTRIES:], f, indent=2)
    except OSError:
        pass


# ---------------------------------------------------------------------------
# Recording
# ---------------------------------------------------------------------------

def record_task_metric(metric: dict) -> None:
    """Record a task completion metric."""
    metric.setdefault("timestamp", datetime.now().isoformat())
    metric.setdefault("date", datetime.now().strftime("%Y-%m-%d"))
    entries = load_metrics()
    entries.append(metric)
    save_metrics(entries)


def measure_git_changes() -> dict:
    """Measure current uncommitted changes via git diff."""
    stats = {"lines_added": 0, "lines_removed": 0, "files_changed": 0}
    try:
        result = subprocess.run(
            ["git", "diff", "--shortstat"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            text = result.stdout.strip()
            import re
            files = re.search(r"(\d+) file", text)
            insertions = re.search(r"(\d+) insertion", text)
            deletions = re.search(r"(\d+) deletion", text)
            if files:
                stats["files_changed"] = int(files.group(1))
            if insertions:
                stats["lines_added"] = int(insertions.group(1))
            if deletions:
                stats["lines_removed"] = int(deletions.group(1))
    except Exception:
        pass
    return stats


def detect_test_files() -> dict:
    """Detect if test files were created/modified."""
    stats = {"test_files_changed": 0, "code_files_changed": 0, "has_tests": False}
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            files = result.stdout.strip().split("\n") if result.stdout.strip() else []
            for f in files:
                lower = f.lower()
                if any(p in lower for p in ["test_", "_test.", ".test.", "tests/", "spec.", "_spec."]):
                    stats["test_files_changed"] += 1
                elif f.endswith((".py", ".js", ".ts", ".go", ".rs", ".java", ".rb", ".swift")):
                    stats["code_files_changed"] += 1
            stats["has_tests"] = stats["test_files_changed"] > 0
    except Exception:
        pass
    return stats


def run_tests_and_measure() -> dict:
    """Attempt to run project tests and measure results."""
    stats = {"tests_ran": False, "tests_passed": False, "test_output": ""}

    # Try common test runners in order
    runners = [
        (["npm", "test", "--", "--passWithNoTests"], "package.json"),
        (["pytest", "--tb=short", "-q"], "pytest.ini"),
        (["pytest", "--tb=short", "-q"], "setup.py"),
        (["pytest", "--tb=short", "-q"], "pyproject.toml"),
        (["make", "test"], "Makefile"),
        (["go", "test", "./..."], "go.mod"),
        (["cargo", "test"], "Cargo.toml"),
    ]

    for cmd, marker in runners:
        if os.path.exists(marker):
            try:
                result = subprocess.run(
                    cmd, capture_output=True, text=True, timeout=120,
                )
                stats["tests_ran"] = True
                stats["tests_passed"] = result.returncode == 0
                stats["test_output"] = (result.stdout + result.stderr)[-500:]
                break
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue

    return stats


# ---------------------------------------------------------------------------
# Dashboard / aggregation
# ---------------------------------------------------------------------------

def get_dashboard(days: int = 7) -> dict:
    """Aggregate metrics for dashboard display."""
    entries = load_metrics()
    # Filter to recent entries
    from datetime import timedelta
    cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    recent = [e for e in entries if e.get("date", "") >= cutoff_date]

    total_tasks = len(recent)
    completed = sum(1 for e in recent if e.get("status") == "done")
    failed = sum(1 for e in recent if e.get("status") == "failed")

    total_lines_added = sum(e.get("lines_added", 0) for e in recent)
    total_lines_removed = sum(e.get("lines_removed", 0) for e in recent)
    total_files = sum(e.get("files_changed", 0) for e in recent)

    tests_written = sum(e.get("test_files_changed", 0) for e in recent)
    code_without_tests = sum(
        1 for e in recent
        if e.get("code_files_changed", 0) > 0 and not e.get("has_tests", False)
    )
    test_runs = sum(1 for e in recent if e.get("tests_ran", False))
    test_passes = sum(1 for e in recent if e.get("tests_passed", False))

    # Model usage distribution
    model_counts = {}
    for e in recent:
        model = e.get("model", "unknown")
        model_counts[model] = model_counts.get(model, 0) + 1

    # Quality gate stats
    gate_hits = sum(1 for e in recent if e.get("quality_gate_blocked", False))
    hallucination_catches = sum(1 for e in recent if e.get("hallucination_caught", False))
    self_review_fixes = sum(1 for e in recent if e.get("self_review_fixed", False))

    # Cost
    total_cost = sum(e.get("cost_usd", 0) for e in recent if e.get("cost_usd"))

    return {
        "period_days": days,
        "tasks": {
            "total": total_tasks,
            "completed": completed,
            "failed": failed,
            "success_rate": round(completed / max(1, total_tasks) * 100, 1),
        },
        "code": {
            "lines_added": total_lines_added,
            "lines_removed": total_lines_removed,
            "net_lines": total_lines_added - total_lines_removed,
            "files_changed": total_files,
        },
        "testing": {
            "test_files_written": tests_written,
            "code_tasks_without_tests": code_without_tests,
            "test_runs": test_runs,
            "test_passes": test_passes,
            "pass_rate": round(test_passes / max(1, test_runs) * 100, 1),
        },
        "quality": {
            "gate_blocks": gate_hits,
            "hallucinations_caught": hallucination_catches,
            "self_review_fixes": self_review_fixes,
        },
        "models": model_counts,
        "cost_usd": round(total_cost, 2),
    }


def format_dashboard(stats: dict) -> str:
    """Format dashboard as human-readable text."""
    t = stats["tasks"]
    c = stats["code"]
    te = stats["testing"]
    q = stats["quality"]

    lines = [
        f"Orchestrator Metrics (last {stats['period_days']} days)",
        "",
        "TASKS",
        f"  Completed:  {t['completed']}/{t['total']} ({t['success_rate']}% success)",
        f"  Failed:     {t['failed']}",
        "",
        "CODE",
        f"  Lines:      +{c['lines_added']} -{c['lines_removed']} (net {c['net_lines']})",
        f"  Files:      {c['files_changed']} changed",
        "",
        "TESTING",
        f"  Test files: {te['test_files_written']} written",
        f"  Pass rate:  {te['test_passes']}/{te['test_runs']} ({te['pass_rate']}%)",
        f"  Code w/o tests: {te['code_tasks_without_tests']} tasks",
        "",
        "QUALITY GATES",
        f"  Blocks:              {q['gate_blocks']}",
        f"  Hallucinations caught: {q['hallucinations_caught']}",
        f"  Self-review fixes:   {q['self_review_fixes']}",
        "",
        "MODEL USAGE",
    ]
    for model, count in sorted(stats["models"].items()):
        lines.append(f"  {model}: {count} tasks")

    if stats["cost_usd"] > 0:
        lines.extend(["", f"COST: ${stats['cost_usd']:.2f}"])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Orchestrator metrics")
    parser.add_argument("--dashboard", action="store_true", help="Print dashboard")
    parser.add_argument("--json", action="store_true", help="Print JSON stats")
    parser.add_argument("--days", type=int, default=7, help="Dashboard period (default 7)")
    parser.add_argument("--record", type=str, help="Record a metric (JSON string)")
    parser.add_argument("--measure-changes", action="store_true", help="Measure current git changes")
    args = parser.parse_args()

    if args.record:
        metric = json.loads(args.record)
        record_task_metric(metric)
        print("Recorded")
    elif args.measure_changes:
        changes = measure_git_changes()
        tests = detect_test_files()
        print(json.dumps({**changes, **tests}, indent=2))
    elif args.json:
        print(json.dumps(get_dashboard(args.days), indent=2))
    else:
        print(format_dashboard(get_dashboard(args.days)))


if __name__ == "__main__":
    main()
