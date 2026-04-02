#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Intelligent model router for the orchestrator.

Combines two signals to select the optimal model:
  1. Task complexity (from the-chief assessment): what the task NEEDS
  2. Throttle score (from throttle.py): what resources ALLOW

The model that ships is min(what_task_needs, what_resources_allow).

Usage:
    # As a module
    from utils.model_router import select_model
    model = select_model(complexity=7, throttle_score=0.3)

    # As a CLI
    uv run model_router.py --complexity 7 --throttle 0.3
    uv run model_router.py --complexity 4              # throttle auto-read
"""

import argparse
import json
import os
import subprocess
from dataclasses import dataclass

# Model tiers ordered by capability (and cost)
MODEL_TIERS = ["haiku", "sonnet", "opus"]


@dataclass
class ModelDecision:
    model: str              # Selected model
    reason: str             # Why this model was chosen
    task_needs: str         # What the task complexity calls for
    resources_allow: str    # What the throttle allows
    complexity: int         # Input complexity score
    throttle_score: float   # Input throttle score


def complexity_to_model(complexity: int) -> str:
    """Map task complexity score to minimum required model.

    Complexity scale (from the-chief):
        1-3:  Trivial (one-line fix, config change)  → Haiku
        4-5:  Simple (single-file, clear scope)      → Haiku
        6-7:  Moderate (multi-file, some reasoning)  → Sonnet
        8-9:  Complex (multi-step, needs planning)   → Sonnet
       10-12: Ambitious (architectural, novel)       → Opus
    """
    if complexity <= 5:
        return "haiku"
    elif complexity <= 9:
        return "sonnet"
    else:
        return "opus"


def throttle_to_model(throttle_score: float) -> str:
    """Map throttle score to maximum allowed model.

    This is the resource ceiling — even if the task needs Opus,
    if resources are constrained, we cap at a lower tier.
    """
    if throttle_score < 0.25:
        return "opus"
    elif throttle_score < 0.45:
        return "sonnet"
    elif throttle_score < 0.65:
        return "sonnet"
    elif throttle_score < 0.85:
        return "haiku"
    else:
        return "haiku"  # Throttle should stop before this, but fallback


def get_current_throttle_score() -> float:
    """Read current throttle score."""
    try:
        throttle_script = os.path.expanduser("~/.claude/hooks/utils/throttle.py")
        result = subprocess.run(
            ["uv", "run", "--no-project", throttle_script, "--score-only"],
            capture_output=True, text=True, timeout=20,
        )
        if result.returncode == 0:
            return float(result.stdout.strip())
    except Exception:
        pass
    return 0.0  # Assume no constraint if throttle unavailable


def select_model(complexity: int, throttle_score: float | None = None) -> ModelDecision:
    """Select the optimal model given task complexity and resource constraints.

    Returns the LESSER of what the task needs and what resources allow.
    """
    if throttle_score is None:
        throttle_score = get_current_throttle_score()

    task_needs = complexity_to_model(complexity)
    resources_allow = throttle_to_model(throttle_score)

    # Take the lesser tier
    task_tier = MODEL_TIERS.index(task_needs)
    resource_tier = MODEL_TIERS.index(resources_allow)
    selected_tier = min(task_tier, resource_tier)
    selected = MODEL_TIERS[selected_tier]

    # Build reason
    if selected == task_needs and selected == resources_allow:
        reason = f"Complexity {complexity} and throttle {throttle_score:.2f} both agree on {selected}"
    elif task_tier < resource_tier:
        reason = f"Task only needs {task_needs} (complexity {complexity}) — no need for {resources_allow}"
    else:
        reason = f"Task wants {task_needs} but resources cap at {resources_allow} (throttle {throttle_score:.2f})"

    return ModelDecision(
        model=selected,
        reason=reason,
        task_needs=task_needs,
        resources_allow=resources_allow,
        complexity=complexity,
        throttle_score=throttle_score,
    )


def main():
    parser = argparse.ArgumentParser(description="Model router")
    parser.add_argument("--complexity", type=int, required=True, help="Task complexity (1-12)")
    parser.add_argument("--throttle", type=float, default=None, help="Throttle score (auto-read if omitted)")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    decision = select_model(args.complexity, args.throttle)

    if args.json:
        print(json.dumps({
            "model": decision.model,
            "reason": decision.reason,
            "task_needs": decision.task_needs,
            "resources_allow": decision.resources_allow,
            "complexity": decision.complexity,
            "throttle_score": decision.throttle_score,
        }, indent=2))
    else:
        print(f"Model: {decision.model}")
        print(f"Reason: {decision.reason}")


if __name__ == "__main__":
    main()
