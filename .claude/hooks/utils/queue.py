"""Higher-level queue operations built on vault.py."""

from datetime import datetime, timedelta
from pathlib import Path

from . import vault


def get_next_ready_task() -> tuple[Path, dict] | None:
    """Find the highest-priority task with all dependencies satisfied.

    Returns (path, frontmatter) or None if no ready tasks.
    """
    queue = vault.get_queue()
    if not queue:
        return None

    done_ids = _get_done_ids()

    for task_path, fm in queue:
        deps = fm.get("dependencies") or []
        if check_dependencies(deps, done_ids):
            return task_path, fm

    return None


def check_dependencies(deps: list[str], done_ids: set[str]) -> bool:
    """Check if all dependency IDs exist in the done set."""
    if not deps:
        return True
    return all(dep_id in done_ids for dep_id in deps)


def _get_done_ids() -> set[str]:
    """Get IDs of all completed tasks."""
    done_dir = vault._task_dir("Done")
    if not done_dir.exists():
        return set()
    ids = set()
    for f in done_dir.glob("*.md"):
        fm, _ = vault.parse_frontmatter(f)
        task_id = fm.get("id")
        if task_id:
            ids.add(str(task_id))
    return ids


def detect_stale_tasks(timeout_hours: int = 2) -> list[tuple[Path, dict]]:
    """Find Active/ tasks with old started timestamps (crash recovery)."""
    active = vault.get_active()
    cutoff = datetime.now() - timedelta(hours=timeout_hours)
    stale = []
    for path, fm in active:
        started = fm.get("started")
        if started:
            try:
                started_dt = datetime.strptime(str(started), "%Y-%m-%d %H:%M")
                if started_dt < cutoff:
                    stale.append((path, fm))
            except ValueError:
                stale.append((path, fm))
    return stale


def get_queue_stats() -> dict:
    """Get task counts by status for the /queue command."""
    inbox_dir = vault._task_dir("Inbox")
    queue_dir = vault._task_dir("Queue")
    active_dir = vault._task_dir("Active")
    done_dir = vault._task_dir("Done")

    def count_md(d: Path) -> int:
        return len(list(d.glob("*.md"))) if d.exists() else 0

    return {
        "inbox": count_md(inbox_dir),
        "queued": count_md(queue_dir),
        "active": count_md(active_dir),
        "done": count_md(done_dir),
    }
