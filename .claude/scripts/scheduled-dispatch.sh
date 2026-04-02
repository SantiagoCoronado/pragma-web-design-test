#!/usr/bin/env bash
# scheduled-dispatch.sh — Headless orchestrator dispatch via cron
#
# Crontab entry (weekdays at 6 AM):
#   0 6 * * 1-5 ~/.claude/scripts/scheduled-dispatch.sh >> ~/.claude/logs/dispatch.log 2>&1
#
# Requirements:
#   - claude CLI in PATH
#   - Logged in (run `claude login` once)
#   - caffeinate keeps machine awake during execution

set -euo pipefail

LOG_DIR="$HOME/.claude/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Starting scheduled dispatch"

# Check if claude is available
if ! command -v claude &>/dev/null; then
    echo "[$TIMESTAMP] ERROR: claude not found in PATH"
    exit 1
fi

# Check throttle before starting
THROTTLE_SCRIPT="$HOME/.claude/hooks/utils/throttle.py"
if [ -f "$THROTTLE_SCRIPT" ]; then
    SCORE=$(uv run --no-project "$THROTTLE_SCRIPT" --score-only 2>/dev/null || echo "0.00")
    echo "[$TIMESTAMP] Throttle score: $SCORE"

    # Don't start if throttle says stop
    if (( $(echo "$SCORE > 0.85" | bc -l 2>/dev/null || echo 0) )); then
        echo "[$TIMESTAMP] Throttle score too high ($SCORE), skipping dispatch"
        exit 0
    fi
fi

# Run dispatch with caffeinate to prevent sleep during execution
export CLAUDE_ORCHESTRATOR_MODE=1
export OBSIDIAN_VAULT_PATH="${OBSIDIAN_VAULT_PATH:-$HOME/Documents/Vaults/boldorigins}"

VAULT="$OBSIDIAN_VAULT_PATH"

caffeinate -i claude -p \
    "Read the task queue from ${VAULT}/Claude/Queue/ and process tasks. For each task: claim it (move to Active/), execute the work in the task repo directory, run tests, commit, and move to Done/. Check the throttle between tasks. Write results to the vault and append a summary to today daily note." \
    --dangerously-skip-permissions \
    --verbose \
    >> "$LOG_DIR/dispatch-$(date '+%Y-%m-%d').log" 2>&1

EXIT_CODE=$?
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Dispatch finished with exit code $EXIT_CODE"
