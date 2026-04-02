#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["mcp>=1.0.0"]
# ///

"""
Claude Code Session Orchestrator — MCP Server

Spawns, manages, and collects results from background `claude -p` sessions.
State is persisted to ~/.claude/orchestrator/sessions/ so it survives restarts.
"""

import asyncio
import json
import os
import signal
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from mcp.server.fastmcp import FastMCP

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

STATE_DIR = Path.home() / ".claude" / "orchestrator" / "sessions"
CONFIG_PATH = Path.home() / ".claude" / "orchestrator" / "config.json"

DEFAULT_BUDGET = 1.00
MAX_CONCURRENT = 5
SESSION_TIMEOUT = 1800  # 30 min
STALE_DAYS = 7  # auto-clean sessions older than this

# ---------------------------------------------------------------------------
# State helpers
# ---------------------------------------------------------------------------


def _state_dir() -> Path:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    return STATE_DIR


def _load_config() -> dict:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            return json.load(f)
    return {}


def _write_meta(sid: str, meta: dict) -> None:
    path = _state_dir() / f"{sid}.meta.json"
    with open(path, "w") as f:
        json.dump(meta, f, indent=2)


def _read_meta(sid: str) -> dict | None:
    path = _state_dir() / f"{sid}.meta.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


def _pid_alive(pid: int) -> bool:
    if not pid:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def _reconcile(meta: dict) -> dict:
    """Check PID liveness for supposedly-running sessions, update if dead."""
    if meta["status"] in ("running", "starting", "queued"):
        pid = meta.get("pid")
        if pid and not _pid_alive(pid):
            meta["status"] = "failed"
            meta["error"] = "Process died unexpectedly"
            meta["ended_at"] = datetime.now().isoformat()
            _write_meta(meta["session_id"], meta)
        elif not pid and meta["status"] == "running":
            meta["status"] = "failed"
            meta["error"] = "No PID recorded"
            meta["ended_at"] = datetime.now().isoformat()
            _write_meta(meta["session_id"], meta)
    return meta


# ---------------------------------------------------------------------------
# Concurrency control
# ---------------------------------------------------------------------------

_semaphore: asyncio.Semaphore | None = None
_tasks: dict[str, asyncio.Task] = {}


def _get_semaphore() -> asyncio.Semaphore:
    global _semaphore
    if _semaphore is None:
        cfg = _load_config()
        limit = cfg.get("max_concurrent", MAX_CONCURRENT)
        _semaphore = asyncio.Semaphore(limit)
    return _semaphore


# ---------------------------------------------------------------------------
# Session runner
# ---------------------------------------------------------------------------


async def _run_session(
    sid: str, cmd: list[str], cwd: str, timeout: int
) -> None:
    """Execute a claude CLI session, capturing output to state files."""
    meta = _read_meta(sid)
    if not meta:
        return

    result_path = _state_dir() / f"{sid}.result.json"

    # Wait for concurrency slot
    meta["status"] = "queued"
    _write_meta(sid, meta)

    sem = _get_semaphore()
    async with sem:
        meta = _read_meta(sid) or meta
        # Check if cancelled while queued
        if meta["status"] == "cancelled":
            return

        meta["status"] = "running"
        _write_meta(sid, meta)

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd,
            )

            meta["pid"] = proc.pid
            _write_meta(sid, meta)

            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(), timeout=timeout
                )
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()
                meta["status"] = "timeout"
                meta["ended_at"] = datetime.now().isoformat()
                meta["error"] = f"Timed out after {timeout}s"
                _write_meta(sid, meta)
                return

            meta["exit_code"] = proc.returncode
            meta["ended_at"] = datetime.now().isoformat()

            if proc.returncode == 0:
                meta["status"] = "completed"
                with open(result_path, "wb") as f:
                    f.write(stdout)
                # Try to extract cost from JSON result
                try:
                    result_data = json.loads(stdout)
                    if isinstance(result_data, dict):
                        meta["cost_usd"] = result_data.get("cost_usd")
                        meta["duration_ms"] = result_data.get("duration_ms")
                        meta["session_id_claude"] = result_data.get("session_id")
                except (json.JSONDecodeError, KeyError):
                    pass
            else:
                meta["status"] = "failed"
                meta["error"] = stderr.decode("utf-8", errors="replace")[:2000]
                # Still save stdout if any
                if stdout:
                    with open(result_path, "wb") as f:
                        f.write(stdout)

            _write_meta(sid, meta)

        except FileNotFoundError:
            meta["status"] = "failed"
            meta["ended_at"] = datetime.now().isoformat()
            meta["error"] = "claude CLI not found in PATH"
            _write_meta(sid, meta)
        except asyncio.CancelledError:
            meta["status"] = "cancelled"
            meta["ended_at"] = datetime.now().isoformat()
            _write_meta(sid, meta)
        except Exception as e:
            meta["status"] = "failed"
            meta["ended_at"] = datetime.now().isoformat()
            meta["error"] = f"{type(e).__name__}: {e}"
            _write_meta(sid, meta)


# ---------------------------------------------------------------------------
# Core spawn logic (used by both spawn and batch tools)
# ---------------------------------------------------------------------------


async def _spawn_session(
    prompt: str,
    model: str = "sonnet",
    budget_usd: float = DEFAULT_BUDGET,
    working_directory: str | None = None,
    agent: str | None = None,
    worktree: bool = False,
    system_prompt: str | None = None,
    append_system_prompt: str | None = None,
    permission_mode: str = "bypassPermissions",
    name: str | None = None,
    timeout_seconds: int = SESSION_TIMEOUT,
    allowed_tools: str | None = None,
    bare: bool = False,
) -> dict:
    """Spawn a single session. Returns metadata dict."""
    sid = str(uuid.uuid4())[:8]
    cwd = working_directory or os.getcwd()

    # Validate working directory
    if not os.path.isdir(cwd):
        return {"error": f"Working directory does not exist: {cwd}"}

    # Build command
    cmd = [
        "claude",
        "-p",
        "--output-format", "json",
        "--model", model,
        "--max-budget-usd", str(budget_usd),
        "--permission-mode", permission_mode,
    ]

    if agent:
        cmd.extend(["--agent", agent])
    if worktree:
        cmd.append("-w")
    if system_prompt:
        cmd.extend(["--system-prompt", system_prompt])
    if append_system_prompt:
        cmd.extend(["--append-system-prompt", append_system_prompt])
    if name:
        cmd.extend(["--name", name])
    if allowed_tools:
        cmd.extend(["--allowed-tools", allowed_tools])
    if bare:
        cmd.append("--bare")

    cmd.append(prompt)

    # Write initial metadata
    meta = {
        "session_id": sid,
        "prompt": prompt[:500],
        "model": model,
        "budget_usd": budget_usd,
        "working_directory": cwd,
        "agent": agent,
        "worktree": worktree,
        "permission_mode": permission_mode,
        "name": name or f"{agent or model}:{sid}",
        "status": "starting",
        "pid": None,
        "exit_code": None,
        "cost_usd": None,
        "duration_ms": None,
        "started_at": datetime.now().isoformat(),
        "ended_at": None,
        "error": None,
    }
    _write_meta(sid, meta)

    # Launch background task
    task = asyncio.create_task(_run_session(sid, cmd, cwd, timeout_seconds))
    _tasks[sid] = task

    return {
        "session_id": sid,
        "status": "spawned",
        "name": meta["name"],
        "model": model,
        "budget_usd": budget_usd,
        "working_directory": cwd,
    }


# ---------------------------------------------------------------------------
# MCP Server + Tools
# ---------------------------------------------------------------------------

mcp = FastMCP(
    "claude-orchestrator",
    instructions=(
        "Session orchestrator for spawning and managing background Claude Code "
        "sessions. Use orchestrator_spawn for single tasks, orchestrator_batch "
        "for parallel work. Poll with orchestrator_list, collect with "
        "orchestrator_result."
    ),
)


@mcp.tool()
async def orchestrator_spawn(
    prompt: str,
    model: str = "sonnet",
    budget_usd: float = 1.0,
    working_directory: str | None = None,
    agent: str | None = None,
    worktree: bool = False,
    system_prompt: str | None = None,
    append_system_prompt: str | None = None,
    permission_mode: str = "bypassPermissions",
    name: str | None = None,
    timeout_seconds: int = 1800,
    allowed_tools: str | None = None,
    bare: bool = False,
) -> str:
    """Spawn a new Claude Code session in the background.

    The session runs `claude -p` as a subprocess and captures structured JSON
    output. Poll with orchestrator_list and collect results with
    orchestrator_result.

    Args:
        prompt: The task/prompt for the session.
        model: Model to use (sonnet, opus, haiku).
        budget_usd: Max spend for this session (default $1.00).
        working_directory: Directory to run in (defaults to caller's cwd).
        agent: Name of a configured agent to invoke (e.g. oracle-translator).
        worktree: Create a git worktree for isolation.
        system_prompt: Override the default system prompt entirely.
        append_system_prompt: Append text to the default system prompt.
        permission_mode: Permission mode (bypassPermissions, default, plan, etc.).
        name: Display name for the session.
        timeout_seconds: Max duration in seconds before killing (default 1800).
        allowed_tools: Space-separated tool names to allow (e.g. "Read Grep Glob").
        bare: Minimal mode — skip hooks, LSP, plugins. Faster but no CLAUDE.md.
    """
    result = await _spawn_session(
        prompt=prompt,
        model=model,
        budget_usd=budget_usd,
        working_directory=working_directory,
        agent=agent,
        worktree=worktree,
        system_prompt=system_prompt,
        append_system_prompt=append_system_prompt,
        permission_mode=permission_mode,
        name=name,
        timeout_seconds=timeout_seconds,
        allowed_tools=allowed_tools,
        bare=bare,
    )
    return json.dumps(result)


@mcp.tool()
async def orchestrator_list(
    status_filter: str | None = None,
    limit: int = 20,
) -> str:
    """List all managed sessions with their current status.

    Automatically reconciles PID liveness — dead processes are marked failed.

    Args:
        status_filter: Filter by status (running, completed, failed, timeout, queued, cancelled).
        limit: Max sessions to return (default 20, newest first).
    """
    sessions = []
    meta_files = sorted(
        _state_dir().glob("*.meta.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    for meta_file in meta_files:
        try:
            with open(meta_file) as f:
                meta = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue

        meta = _reconcile(meta)

        if status_filter and meta["status"] != status_filter:
            continue

        sessions.append({
            "session_id": meta["session_id"],
            "name": meta.get("name"),
            "prompt": meta["prompt"][:100],
            "model": meta["model"],
            "status": meta["status"],
            "cost_usd": meta.get("cost_usd"),
            "started_at": meta["started_at"],
            "ended_at": meta.get("ended_at"),
            "error": (meta.get("error") or "")[:200] or None,
        })

        if len(sessions) >= limit:
            break

    running = sum(1 for s in sessions if s["status"] in ("running", "queued"))
    return json.dumps({
        "sessions": sessions,
        "total": len(sessions),
        "running": running,
    })


@mcp.tool()
async def orchestrator_result(session_id: str) -> str:
    """Get the structured JSON result from a completed session.

    Args:
        session_id: The session ID (8-char hex from orchestrator_spawn).
    """
    meta = _read_meta(session_id)
    if not meta:
        return json.dumps({"error": f"Session {session_id} not found"})

    meta = _reconcile(meta)

    if meta["status"] in ("running", "queued", "starting"):
        return json.dumps({
            "session_id": session_id,
            "status": meta["status"],
            "message": "Session still in progress. Poll again later.",
        })

    result_path = _state_dir() / f"{session_id}.result.json"
    result_data = None

    if result_path.exists():
        try:
            with open(result_path) as f:
                result_data = json.load(f)
        except json.JSONDecodeError:
            with open(result_path) as f:
                raw = f.read()
            result_data = {"raw_output": raw[:10000]}

    return json.dumps({
        "session_id": session_id,
        "status": meta["status"],
        "result": result_data,
        "meta": {
            "name": meta.get("name"),
            "model": meta["model"],
            "budget_usd": meta["budget_usd"],
            "cost_usd": meta.get("cost_usd"),
            "started_at": meta["started_at"],
            "ended_at": meta.get("ended_at"),
            "exit_code": meta.get("exit_code"),
            "working_directory": meta.get("working_directory"),
            "error": meta.get("error"),
        },
    })


@mcp.tool()
async def orchestrator_cancel(session_id: str) -> str:
    """Cancel a running or queued session.

    Sends SIGTERM first, then SIGKILL if the process doesn't exit.

    Args:
        session_id: The session ID to cancel.
    """
    meta = _read_meta(session_id)
    if not meta:
        return json.dumps({"error": f"Session {session_id} not found"})

    if meta["status"] not in ("running", "queued", "starting"):
        return json.dumps({
            "error": f"Session not cancellable (status: {meta['status']})",
        })

    pid = meta.get("pid")
    if pid and _pid_alive(pid):
        try:
            os.kill(pid, signal.SIGTERM)
            await asyncio.sleep(1)
            if _pid_alive(pid):
                os.kill(pid, signal.SIGKILL)
        except OSError:
            pass

    # Cancel asyncio task if tracked
    task = _tasks.get(session_id)
    if task and not task.done():
        task.cancel()

    meta["status"] = "cancelled"
    meta["ended_at"] = datetime.now().isoformat()
    _write_meta(session_id, meta)

    return json.dumps({"session_id": session_id, "status": "cancelled"})


@mcp.tool()
async def orchestrator_batch(
    tasks: list[dict],
    model: str = "sonnet",
    budget_per_task: float = 1.0,
    working_directory: str | None = None,
    timeout_seconds: int = 1800,
) -> str:
    """Spawn multiple sessions with concurrency control.

    All sessions are launched immediately but the global concurrency semaphore
    ensures only MAX_CONCURRENT run simultaneously. Use orchestrator_list to
    poll progress and orchestrator_result to collect outputs.

    Args:
        tasks: List of task objects. Each must have "prompt". Optional keys:
               "agent", "name", "model", "budget_usd", "worktree",
               "system_prompt", "append_system_prompt", "working_directory".
        model: Default model for tasks that don't specify one.
        budget_per_task: Default budget per task.
        working_directory: Default working directory for all tasks.
        timeout_seconds: Max duration per task (default 1800).
    """
    if not tasks:
        return json.dumps({"error": "No tasks provided"})

    batch_id = str(uuid.uuid4())[:8]
    spawned = []
    errors = []

    for i, task_spec in enumerate(tasks):
        if not isinstance(task_spec, dict) or "prompt" not in task_spec:
            errors.append({"index": i, "error": "Missing 'prompt' key"})
            continue

        result = await _spawn_session(
            prompt=task_spec["prompt"],
            model=task_spec.get("model", model),
            budget_usd=task_spec.get("budget_usd", budget_per_task),
            working_directory=task_spec.get("working_directory", working_directory),
            agent=task_spec.get("agent"),
            worktree=task_spec.get("worktree", False),
            system_prompt=task_spec.get("system_prompt"),
            append_system_prompt=task_spec.get("append_system_prompt"),
            permission_mode=task_spec.get("permission_mode", "bypassPermissions"),
            name=task_spec.get("name", f"batch-{batch_id}-{i}"),
            timeout_seconds=timeout_seconds,
            bare=task_spec.get("bare", False),
        )

        if "error" in result:
            errors.append({"index": i, "error": result["error"]})
        else:
            spawned.append(result)

    return json.dumps({
        "batch_id": batch_id,
        "spawned": spawned,
        "total_spawned": len(spawned),
        "errors": errors,
        "session_ids": [s["session_id"] for s in spawned],
    })


# ---------------------------------------------------------------------------
# Startup: orphan cleanup + stale session purge
# ---------------------------------------------------------------------------


def _cleanup_orphans() -> None:
    """Mark dead-but-running sessions as failed on server startup."""
    state_dir = _state_dir()
    cutoff = datetime.now() - timedelta(days=STALE_DAYS)

    for meta_file in state_dir.glob("*.meta.json"):
        try:
            with open(meta_file) as f:
                meta = json.load(f)

            sid = meta["session_id"]

            # Reconcile running sessions
            if meta["status"] in ("running", "starting", "queued"):
                pid = meta.get("pid")
                if not pid or not _pid_alive(pid):
                    meta["status"] = "failed"
                    meta["error"] = "Orphaned (server restarted)"
                    meta["ended_at"] = datetime.now().isoformat()
                    _write_meta(sid, meta)

            # Remove stale completed sessions
            ended = meta.get("ended_at")
            if ended:
                try:
                    ended_dt = datetime.fromisoformat(ended)
                    if ended_dt < cutoff:
                        meta_file.unlink(missing_ok=True)
                        result_file = state_dir / f"{sid}.result.json"
                        result_file.unlink(missing_ok=True)
                except (ValueError, OSError):
                    pass

        except (json.JSONDecodeError, KeyError, OSError):
            pass


_cleanup_orphans()

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()
