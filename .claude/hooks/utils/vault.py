"""Shared utilities for reading/writing Obsidian vault task files."""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path

import yaml

VAULT_PATH_DEFAULT = os.path.expanduser("~/Documents/Vaults/boldorigins")
CLAUDE_DIR = "Claude"


def get_vault_path() -> Path:
    """Get the Obsidian vault path from env or default."""
    return Path(os.environ.get("OBSIDIAN_VAULT_PATH", VAULT_PATH_DEFAULT))


def parse_frontmatter(path: Path) -> tuple[dict, str]:
    """Parse YAML frontmatter and body from a markdown file.

    Returns (frontmatter_dict, body_text).
    """
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n?(.*)", text, re.DOTALL)
    if not match:
        return {}, text
    fm = yaml.safe_load(match.group(1)) or {}
    body = match.group(2)
    return fm, body


def update_frontmatter(path: Path, updates: dict) -> None:
    """Update specific frontmatter fields in a markdown file."""
    fm, body = parse_frontmatter(path)
    fm.update(updates)
    _write_task(path, fm, body)


def _write_task(path: Path, fm: dict, body: str) -> None:
    """Write frontmatter + body back to a markdown file."""
    fm_str = yaml.dump(fm, default_flow_style=False, sort_keys=False).rstrip()
    path.write_text(f"---\n{fm_str}\n---\n{body}", encoding="utf-8")


def _task_dir(subdir: str) -> Path:
    """Get a Claude subdirectory in the vault."""
    return get_vault_path() / CLAUDE_DIR / subdir


def _list_tasks(subdir: str) -> list[tuple[Path, dict]]:
    """List all task files in a subdirectory with parsed frontmatter."""
    d = _task_dir(subdir)
    if not d.exists():
        return []
    tasks = []
    for f in sorted(d.glob("*.md")):
        fm, _ = parse_frontmatter(f)
        if fm:
            tasks.append((f, fm))
    return tasks


def get_queue() -> list[tuple[Path, dict]]:
    """Get all tasks in Queue/, sorted by priority (ascending) then created date."""
    tasks = _list_tasks("Queue")
    return sorted(tasks, key=lambda t: (t[1].get("priority", 5), t[1].get("created", "")))


def get_active() -> list[tuple[Path, dict]]:
    """Get all tasks currently in Active/."""
    return _list_tasks("Active")


def get_done(limit: int = 5) -> list[tuple[Path, dict]]:
    """Get recently completed tasks from Done/, newest first."""
    tasks = _list_tasks("Done")
    tasks.sort(key=lambda t: t[1].get("completed", ""), reverse=True)
    return tasks[:limit]


def claim_task(task_path: Path, session_id: str) -> Path:
    """Move a task from Queue/ to Active/ and update its frontmatter."""
    dest = _task_dir("Active") / task_path.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(task_path), str(dest))
    update_frontmatter(dest, {
        "status": "active",
        "started": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "session_id": session_id,
    })
    return dest


def complete_task(task_path: Path) -> Path:
    """Move a task from Active/ to Done/ and update its frontmatter."""
    dest = _task_dir("Done") / task_path.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(task_path), str(dest))
    update_frontmatter(dest, {
        "status": "done",
        "completed": datetime.now().strftime("%Y-%m-%d %H:%M"),
    })
    return dest


def fail_task(task_path: Path, reason: str) -> None:
    """Mark an Active/ task as failed without moving it."""
    update_frontmatter(task_path, {
        "status": "failed",
    })
    append_session_log(task_path, f"**Failed:** {reason}")


def append_session_log(task_path: Path, log_text: str) -> None:
    """Append text to the ## Session Log section of a task note."""
    fm, body = parse_frontmatter(task_path)
    marker = "## Session Log"
    if marker in body:
        body = body.replace(marker, f"{marker}\n\n{log_text}\n", 1)
    else:
        body = body.rstrip() + f"\n\n{marker}\n\n{log_text}\n"
    _write_task(task_path, fm, body)


def append_daily_note(summary: str) -> None:
    """Append a Claude summary under ## Claude heading in today's daily note."""
    vault = get_vault_path()
    journal_dir = vault / "Journal"
    if not journal_dir.exists():
        return

    today = datetime.now().strftime("%Y-%m-%d")
    # Find today's journal entry (may have date prefix)
    candidates = list(journal_dir.glob(f"{today}*.md"))
    if not candidates:
        return

    note_path = candidates[0]
    content = note_path.read_text(encoding="utf-8")

    claude_section = f"\n\n## Claude\n\n{summary}\n"
    if "## Claude" in content:
        # Append under existing Claude section
        content = content.replace("## Claude", f"## Claude\n\n{summary}", 1)
    else:
        content = content.rstrip() + claude_section

    note_path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Goal utilities
# ---------------------------------------------------------------------------

def get_goals() -> list[tuple[Path, dict]]:
    """Get all active goals from Goals/."""
    goals_dir = _task_dir("Goals")
    if not goals_dir.exists():
        return []
    goals = []
    for f in sorted(goals_dir.glob("*.md")):
        fm, _ = parse_frontmatter(f)
        if fm and fm.get("status") == "active":
            goals.append((f, fm))
    return goals


def get_goal_by_id(goal_id: str) -> tuple[Path, dict] | None:
    """Find a goal by its ID."""
    goals_dir = _task_dir("Goals")
    if not goals_dir.exists():
        return None
    for f in goals_dir.glob("*.md"):
        fm, _ = parse_frontmatter(f)
        if fm and str(fm.get("id")) == str(goal_id):
            return f, fm
    return None


# ---------------------------------------------------------------------------
# Routine utilities
# ---------------------------------------------------------------------------

def get_routines(enabled_only: bool = True) -> list[tuple[Path, dict]]:
    """Get routines from Routines/."""
    routines_dir = _task_dir("Routines")
    if not routines_dir.exists():
        return []
    routines = []
    for f in sorted(routines_dir.glob("*.md")):
        fm, _ = parse_frontmatter(f)
        if fm:
            if enabled_only and not fm.get("enabled", True):
                continue
            routines.append((f, fm))
    return routines


def get_due_routines() -> list[tuple[Path, dict]]:
    """Get routines whose next_run is past due."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    routines = get_routines(enabled_only=True)
    due = []
    for path, fm in routines:
        next_run = fm.get("next_run")
        if next_run and str(next_run) <= now:
            due.append((path, fm))
        elif not next_run:
            # Never run before — it's due
            due.append((path, fm))
    return due
