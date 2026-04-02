#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "psutil",
# ]
# ///
"""Adaptive resource throttle for the AFK orchestrator.

Samples system sensors (thermal, battery, memory) and API usage estimates,
computes a composite throttle score (0.0-1.0), and returns action decisions
(delay, model tier, priority cutoff). Persists rolling state for trend detection.

All methods work WITHOUT sudo on macOS Apple Silicon.

Usage:
    # As a module (from hooks)
    from utils.throttle import get_throttle_decision
    decision = get_throttle_decision()

    # As a CLI (dry-run diagnostics)
    uv run throttle.py --status
    uv run throttle.py --json
"""

import argparse
import json
import os
import re
import subprocess
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path

import psutil


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class SensorReadings:
    """Raw sensor values."""
    thermal_level: str = "unknown"          # Great/Fair/Serious/Critical
    die_temp_c: float | None = None         # CPU/GPU die temp in °C (via IOHIDEventSystemClient)
    battery_temp_c: float | None = None     # Battery temperature in °C
    battery_pct: int | None = None          # Battery percentage 0-100
    is_charging: bool = False               # Plugged in?
    battery_cycle_count: int | None = None  # Lifetime cycles
    battery_health_pct: float | None = None # Current/design capacity %
    memory_pct: float = 0.0                 # Memory usage percentage
    cpu_pct: float = 0.0                    # CPU usage percentage
    timestamp: str = ""                     # ISO timestamp


@dataclass
class PressureScores:
    """Normalized 0.0-1.0 pressure per sensor category."""
    thermal: float = 0.0
    battery: float = 0.0
    memory: float = 0.0
    api: float = 0.0
    trend_bonus: float = 0.0  # Added to thermal if rising trend detected


@dataclass
class ThrottleDecision:
    """Output of the throttle algorithm."""
    score: float = 0.0                # Composite 0.0-1.0
    delay_seconds: int = 0            # Seconds to wait before chaining
    model: str = "opus"               # Recommended model tier
    max_priority: int = 7             # Skip tasks with priority > this
    max_turns: int = 200              # Max turns per session
    should_stop: bool = False         # True = don't chain at all
    dominant_constraint: str = ""     # Which sensor is the bottleneck
    readings: SensorReadings = field(default_factory=SensorReadings)
    pressures: PressureScores = field(default_factory=PressureScores)


# ---------------------------------------------------------------------------
# State persistence (rolling window for trend detection)
# ---------------------------------------------------------------------------

STATE_FILE = os.path.expanduser("~/.claude/throttle-state.json")
MAX_HISTORY = 20  # Keep last N readings


def load_state() -> list[dict]:
    """Load rolling sensor history."""
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return []


def save_state(history: list[dict]) -> None:
    """Persist rolling sensor history."""
    try:
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(history[-MAX_HISTORY:], f, indent=2)
    except OSError:
        pass


# ---------------------------------------------------------------------------
# Sensor collection (no sudo required)
# ---------------------------------------------------------------------------

def read_die_temperature() -> float | None:
    """Read CPU/GPU die temperature via Swift IOHIDEventSystemClient helper.

    Returns average die temperature in °C, or None if unavailable.
    """
    try:
        script_dir = Path(__file__).parent
        sensor_script = script_dir / "thermal_sensor.swift"
        if not sensor_script.exists():
            return None

        result = subprocess.run(
            ["swift", str(sensor_script), "--avg"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode == 0 and result.stdout.strip():
            return float(result.stdout.strip())
    except Exception:
        pass
    return None


def read_thermal_level() -> str:
    """Read macOS thermal pressure via pmset.

    Returns: 'Great', 'Fair', 'Serious', 'Critical', or 'unknown'
    """
    try:
        result = subprocess.run(
            ["pmset", "-g", "therm"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            output = result.stdout.lower()
            # When no thermal events, pmset says "no thermal warning level"
            if "no thermal warning level" in output:
                return "Great"
            for line in result.stdout.splitlines():
                if "thermal level" in line.lower():
                    # "  - thermal level = Great"
                    parts = line.split("=")
                    if len(parts) >= 2:
                        return parts[-1].strip()
    except Exception:
        pass
    return "unknown"


def read_battery() -> tuple[float | None, int | None, bool, int | None, float | None]:
    """Read battery stats from IOKit (no sudo).

    Returns: (temp_celsius, percent, is_charging, cycle_count, health_pct)
    """
    temp_c = None
    pct = None
    charging = False
    cycles = None
    health_pct = None

    try:
        result = subprocess.run(
            ["ioreg", "-r", "-n", "AppleSmartBattery"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            output = result.stdout

            # Temperature (centidegrees / 100 = °C)
            m = re.search(r'"Temperature"\s*=\s*(\d+)', output)
            if m:
                temp_c = int(m.group(1)) / 100.0

            # Current capacity as percentage
            m = re.search(r'"CurrentCapacity"\s*=\s*(\d+)', output)
            if m:
                pct = int(m.group(1))

            # Charging state
            m = re.search(r'"IsCharging"\s*=\s*(\w+)', output)
            if m:
                charging = m.group(1).lower() == "yes"

            # Also check external power
            m = re.search(r'"ExternalConnected"\s*=\s*(\w+)', output)
            if m:
                if m.group(1).lower() == "yes":
                    charging = True

            # Cycle count
            m = re.search(r'"CycleCount"\s*=\s*(\d+)', output)
            if m:
                cycles = int(m.group(1))

            # Health: AppleRawMaxCapacity / DesignCapacity
            raw_max = re.search(r'"AppleRawMaxCapacity"\s*=\s*(\d+)', output)
            design = re.search(r'"DesignCapacity"\s*=\s*(\d+)', output)
            if raw_max and design:
                d = int(design.group(1))
                if d > 0:
                    health_pct = round(int(raw_max.group(1)) / d * 100, 1)

    except Exception:
        pass

    # Fallback for percentage via pmset
    if pct is None:
        try:
            result = subprocess.run(
                ["pmset", "-g", "batt"],
                capture_output=True, text=True, timeout=5
            )
            m = re.search(r"(\d+)%", result.stdout)
            if m:
                pct = int(m.group(1))
            if "charging" in result.stdout.lower() or "ac power" in result.stdout.lower():
                charging = True
        except Exception:
            pass

    return temp_c, pct, charging, cycles, health_pct


def read_memory() -> float:
    """Read memory usage percentage via psutil."""
    try:
        return psutil.virtual_memory().percent
    except Exception:
        return 0.0


def read_cpu() -> float:
    """Read CPU usage percentage via psutil (1-second sample)."""
    try:
        return psutil.cpu_percent(interval=0.5)
    except Exception:
        return 0.0


def read_api_usage() -> dict:
    """Estimate API usage from claude-monitor data and session counter.

    Returns dict with: sessions_today, estimated_messages_used, budget_pct_used
    """
    usage = {
        "sessions_today": 0,
        "estimated_remaining_pct": 100.0,
    }

    # Read orchestrator session counter
    counter_file = os.path.expanduser("~/.claude/orchestrator-session-count")
    try:
        if os.path.exists(counter_file):
            with open(counter_file, "r") as f:
                usage["sessions_today"] = int(f.read().strip())
    except (ValueError, OSError):
        pass

    # Estimate from session logs — count today's sessions
    try:
        log_dir = Path.cwd() / "logs"
        session_log = log_dir / "session_start.json"
        if session_log.exists():
            with open(session_log, "r") as f:
                sessions = json.load(f)
            today = datetime.now().strftime("%Y-%m-%d")
            today_sessions = [
                s for s in sessions
                if s.get("timestamp", "").startswith(today)
            ]
            usage["sessions_today"] = max(usage["sessions_today"], len(today_sessions))
    except Exception:
        pass

    # Estimate remaining budget (Max plan: ~900 messages/day)
    # Conservative: assume ~30 messages per orchestrator session
    max_daily_messages = int(os.environ.get("THROTTLE_MAX_DAILY_MESSAGES", "900"))
    msgs_per_session = int(os.environ.get("THROTTLE_MSGS_PER_SESSION", "30"))
    estimated_used = usage["sessions_today"] * msgs_per_session

    # Factor in time of day — if it's 6 PM and we've used 50%, that's fine
    # If it's 9 AM and we've used 50%, that's aggressive
    hour = datetime.now().hour
    hours_elapsed = max(1, hour)

    # Budget pace: are we ahead or behind the ideal burn rate?
    ideal_pct_used = (hours_elapsed / 24.0) * 100
    actual_pct_used = (estimated_used / max(1, max_daily_messages)) * 100
    usage["estimated_remaining_pct"] = max(0.0, 100.0 - actual_pct_used)

    # Overspend ratio: >1.0 means we're burning faster than sustainable
    if ideal_pct_used > 0:
        usage["burn_rate_ratio"] = actual_pct_used / ideal_pct_used
    else:
        usage["burn_rate_ratio"] = 0.0

    return usage


def collect_readings() -> SensorReadings:
    """Collect all sensor readings."""
    thermal = read_thermal_level()
    die_temp = read_die_temperature()
    temp_c, batt_pct, charging, cycles, health = read_battery()
    memory = read_memory()
    cpu = read_cpu()

    return SensorReadings(
        thermal_level=thermal,
        die_temp_c=die_temp,
        battery_temp_c=temp_c,
        battery_pct=batt_pct,
        is_charging=charging,
        battery_cycle_count=cycles,
        battery_health_pct=health,
        memory_pct=memory,
        cpu_pct=cpu,
        timestamp=datetime.now().isoformat(),
    )


# ---------------------------------------------------------------------------
# Pressure mapping (piecewise linear curves)
# ---------------------------------------------------------------------------

def _lerp(value: float, low: float, high: float) -> float:
    """Linear interpolation: returns 0.0 at low, 1.0 at high, clamped."""
    if high <= low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))


def compute_thermal_pressure(readings: SensorReadings) -> float:
    """Compute thermal pressure from die temp, pmset level, and battery temp.

    Priority: die temp (actual CPU/GPU) > pmset level > battery temp > CPU%.
    """
    # pmset thermal level (qualitative fallback)
    level_map = {"great": 0.0, "fair": 0.35, "serious": 0.7, "critical": 1.0}
    level_pressure = level_map.get(readings.thermal_level.lower(), 0.2)

    # Die temperature (primary — actual CPU/GPU die)
    die_pressure = 0.0
    if readings.die_temp_c is not None:
        # M4 Pro: comfortable <55°C, warm 55-75°C, hot 75-95°C, throttle >95°C
        die_pressure = _lerp(readings.die_temp_c, 55.0, 95.0)

    # Battery temp (secondary proxy for system heat)
    batt_pressure = 0.0
    if readings.battery_temp_c is not None:
        batt_pressure = _lerp(readings.battery_temp_c, 32.0, 45.0)

    # CPU usage as thermal proxy (tertiary)
    cpu_pressure = _lerp(readings.cpu_pct, 70.0, 95.0)

    return max(die_pressure, level_pressure, batt_pressure, cpu_pressure)


def compute_battery_pressure(readings: SensorReadings) -> float:
    """Compute battery pressure. Returns 0.0 if plugged in."""
    if readings.is_charging:
        return 0.0

    if readings.battery_pct is None:
        return 0.0

    pct = readings.battery_pct
    if pct > 50:
        return 0.0
    elif pct > 30:
        return _lerp(50 - pct, 0, 20) * 0.3  # 0.0 at 50%, 0.3 at 30%
    elif pct > 15:
        return 0.3 + _lerp(30 - pct, 0, 15) * 0.35  # 0.3 at 30%, 0.65 at 15%
    elif pct > 5:
        return 0.65 + _lerp(15 - pct, 0, 10) * 0.25  # 0.65 at 15%, 0.9 at 5%
    else:
        return 1.0


def compute_memory_pressure(readings: SensorReadings) -> float:
    """Compute memory pressure."""
    return _lerp(readings.memory_pct, 65.0, 92.0)


def compute_api_pressure() -> float:
    """Compute API budget pressure based on usage pace."""
    usage = read_api_usage()
    remaining_pct = usage.get("estimated_remaining_pct", 100.0)
    burn_ratio = usage.get("burn_rate_ratio", 0.0)

    # Direct remaining check
    remaining_pressure = _lerp(100.0 - remaining_pct, 50.0, 90.0)

    # Burn rate check: if we're burning 2x faster than sustainable
    burn_pressure = _lerp(burn_ratio, 1.5, 3.0)

    return max(remaining_pressure, burn_pressure)


def compute_trend_bonus(history: list[dict]) -> float:
    """Detect rising temperature trend from rolling history.

    Returns 0.0-0.25 bonus added to thermal pressure.
    """
    if len(history) < 3:
        return 0.0

    # Get last N temps (prefer die temp, fall back to battery temp)
    temps = []
    for entry in history[-8:]:
        t = entry.get("die_temp_c") or entry.get("battery_temp_c")
        if t is not None:
            temps.append(t)

    if len(temps) < 3:
        return 0.0

    # Simple trend: compare average of last 3 vs first 3
    recent = sum(temps[-3:]) / 3
    older = sum(temps[:3]) / 3
    delta = recent - older

    # Rising > 2°C across the window = concerning
    if delta > 4.0:
        return 0.25
    elif delta > 2.0:
        return 0.15
    elif delta > 1.0:
        return 0.08
    return 0.0


# ---------------------------------------------------------------------------
# Composite scoring + action mapping
# ---------------------------------------------------------------------------

def compute_pressures(readings: SensorReadings, history: list[dict]) -> PressureScores:
    """Compute all pressure scores."""
    trend = compute_trend_bonus(history)
    return PressureScores(
        thermal=min(1.0, compute_thermal_pressure(readings) + trend),
        battery=compute_battery_pressure(readings),
        memory=compute_memory_pressure(readings),
        api=compute_api_pressure(),
        trend_bonus=trend,
    )


def score_to_decision(
    score: float,
    dominant: str,
    readings: SensorReadings,
    pressures: PressureScores,
) -> ThrottleDecision:
    """Map composite score to concrete actions.

    Score bands:
        0.00 - 0.25  →  Full speed (Opus, no delay, all tasks)
        0.25 - 0.45  →  Warm (Sonnet, 15s delay, all tasks)
        0.45 - 0.65  →  Hot (Sonnet, 60s delay, P1-P5 only)
        0.65 - 0.85  →  Throttled (Haiku, 180s delay, P1-P3 only)
        0.85 - 1.00  →  Stop (don't chain)
    """
    if score < 0.25:
        return ThrottleDecision(
            score=score, delay_seconds=0, model="opus",
            max_priority=7, max_turns=200, should_stop=False,
            dominant_constraint=dominant, readings=readings, pressures=pressures,
        )
    elif score < 0.45:
        return ThrottleDecision(
            score=score, delay_seconds=15, model="sonnet",
            max_priority=7, max_turns=150, should_stop=False,
            dominant_constraint=dominant, readings=readings, pressures=pressures,
        )
    elif score < 0.65:
        return ThrottleDecision(
            score=score, delay_seconds=60, model="sonnet",
            max_priority=5, max_turns=100, should_stop=False,
            dominant_constraint=dominant, readings=readings, pressures=pressures,
        )
    elif score < 0.85:
        return ThrottleDecision(
            score=score, delay_seconds=180, model="haiku",
            max_priority=3, max_turns=50, should_stop=False,
            dominant_constraint=dominant, readings=readings, pressures=pressures,
        )
    else:
        return ThrottleDecision(
            score=score, delay_seconds=0, model="haiku",
            max_priority=1, max_turns=0, should_stop=True,
            dominant_constraint=dominant, readings=readings, pressures=pressures,
        )


def get_throttle_decision() -> ThrottleDecision:
    """Main entry point: collect sensors, compute score, return decision."""
    # Collect current readings
    readings = collect_readings()

    # Load history and compute trend
    history = load_state()
    pressures = compute_pressures(readings, history)

    # Save current reading to history
    history.append({
        "die_temp_c": readings.die_temp_c,
        "battery_temp_c": readings.battery_temp_c,
        "thermal_level": readings.thermal_level,
        "battery_pct": readings.battery_pct,
        "memory_pct": readings.memory_pct,
        "cpu_pct": readings.cpu_pct,
        "timestamp": readings.timestamp,
    })
    save_state(history)

    # Composite: max of all pressures (worst constraint dominates)
    pressure_map = {
        "thermal": pressures.thermal,
        "battery": pressures.battery,
        "memory": pressures.memory,
        "api": pressures.api,
    }
    dominant = max(pressure_map, key=lambda k: pressure_map[k])
    score = pressure_map[dominant]

    return score_to_decision(score, dominant, readings, pressures)


# ---------------------------------------------------------------------------
# CLI interface
# ---------------------------------------------------------------------------

def format_status(decision: ThrottleDecision) -> str:
    """Format human-readable status output."""
    r = decision.readings
    p = decision.pressures

    bars = {
        "thermal": _bar(p.thermal),
        "battery": _bar(p.battery),
        "memory": _bar(p.memory),
        "api": _bar(p.api),
    }

    charging_str = "charging" if r.is_charging else "discharging"
    die_str = f"die {r.die_temp_c:.1f}°C" if r.die_temp_c else ""
    batt_temp_str = f"batt {r.battery_temp_c:.1f}°C" if r.battery_temp_c else ""
    temp_parts = [s for s in [die_str, batt_temp_str] if s]
    temp_str = ", ".join(temp_parts) if temp_parts else "n/a"
    health_str = f"{r.battery_health_pct:.0f}%" if r.battery_health_pct else "n/a"
    trend_str = f" (+{p.trend_bonus:.2f} trend)" if p.trend_bonus > 0 else ""

    action = "STOP" if decision.should_stop else f"{decision.model} | {decision.delay_seconds}s delay | P1-P{decision.max_priority} | {decision.max_turns} turns"

    lines = [
        f"Throttle Score: {decision.score:.2f} [{_bar(decision.score)}] → {decision.dominant_constraint}",
        "",
        f"  Thermal:  {bars['thermal']} {p.thermal:.2f}  ({r.thermal_level}, {temp_str}){trend_str}",
        f"  Battery:  {bars['battery']} {p.battery:.2f}  ({r.battery_pct}%, {charging_str}, {r.battery_cycle_count} cycles, {health_str} health)",
        f"  Memory:   {bars['memory']} {p.memory:.2f}  ({r.memory_pct:.0f}% used)",
        f"  API:      {bars['api']} {p.api:.2f}",
        f"  CPU:      {r.cpu_pct:.0f}%",
        "",
        f"  Action: {action}",
    ]
    return "\n".join(lines)


def _bar(value: float, width: int = 20) -> str:
    """Render a 0.0-1.0 value as a progress bar."""
    filled = int(value * width)
    empty = width - filled
    if value < 0.3:
        return f"[{'█' * filled}{'░' * empty}]"
    elif value < 0.7:
        return f"[{'█' * filled}{'░' * empty}]"
    else:
        return f"[{'█' * filled}{'░' * empty}]"


def main():
    parser = argparse.ArgumentParser(description="Adaptive resource throttle")
    parser.add_argument("--status", action="store_true", help="Print human-readable status")
    parser.add_argument("--json", action="store_true", help="Print JSON decision")
    parser.add_argument("--score-only", action="store_true", help="Print just the score (0.0-1.0)")
    args = parser.parse_args()

    decision = get_throttle_decision()

    if args.json:
        # Serialize dataclasses to JSON
        out = {
            "score": decision.score,
            "delay_seconds": decision.delay_seconds,
            "model": decision.model,
            "max_priority": decision.max_priority,
            "max_turns": decision.max_turns,
            "should_stop": decision.should_stop,
            "dominant_constraint": decision.dominant_constraint,
            "readings": asdict(decision.readings),
            "pressures": asdict(decision.pressures),
        }
        print(json.dumps(out, indent=2))
    elif args.score_only:
        print(f"{decision.score:.2f}")
    else:
        # Default: --status
        print(format_status(decision))


if __name__ == "__main__":
    main()
