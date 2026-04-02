#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///

import argparse
import json
import os
import random
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def get_completion_messages():
    """Return list of friendly completion messages."""
    return [
        "Work complete!",
        "All done!",
        "Task finished!",
        "Job complete!",
        "Ready for next task!",
    ]


def get_tts_script_path():
    """
    Determine which TTS script to use based on available API keys.
    Priority order: ElevenLabs > OpenAI > pyttsx3
    """
    # Get current script directory and construct utils/tts path
    script_dir = Path(__file__).parent
    tts_dir = script_dir / "utils" / "tts"

    # Check for ElevenLabs API key (highest priority)
    if os.getenv("ELEVENLABS_API_KEY"):
        elevenlabs_script = tts_dir / "elevenlabs_tts.py"
        if elevenlabs_script.exists():
            return str(elevenlabs_script)

    # Check for OpenAI API key (second priority)
    if os.getenv("OPENAI_API_KEY"):
        openai_script = tts_dir / "openai_tts.py"
        if openai_script.exists():
            return str(openai_script)

    # Fall back to pyttsx3 (no API key required)
    pyttsx3_script = tts_dir / "pyttsx3_tts.py"
    if pyttsx3_script.exists():
        return str(pyttsx3_script)

    return None


def get_llm_completion_message():
    """
    Generate completion message using available LLM services.
    Priority order: OpenAI > Anthropic > fallback to random message

    Returns:
        str: Generated or fallback completion message
    """
    # Get current script directory and construct utils/llm path
    script_dir = Path(__file__).parent
    llm_dir = script_dir / "utils" / "llm"

    # Try OpenAI first (highest priority)
    if os.getenv("OPENAI_API_KEY"):
        oai_script = llm_dir / "oai.py"
        if oai_script.exists():
            try:
                result = subprocess.run(
                    ["uv", "run", str(oai_script), "--completion"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip()
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass

    # Try Anthropic second
    if os.getenv("ANTHROPIC_API_KEY"):
        anth_script = llm_dir / "anth.py"
        if anth_script.exists():
            try:
                result = subprocess.run(
                    ["uv", "run", str(anth_script), "--completion"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip()
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                pass

    # Fallback to random predefined message
    messages = get_completion_messages()
    return random.choice(messages)


def announce_completion():
    """Announce completion using the best available TTS service."""
    try:
        tts_script = get_tts_script_path()
        if not tts_script:
            return  # No TTS scripts available

        # Get completion message (LLM-generated or fallback)
        completion_message = get_llm_completion_message()

        # Call the TTS script with the completion message
        subprocess.run(
            ["uv", "run", tts_script, completion_message],
            capture_output=True,  # Suppress output
            timeout=10,  # 10-second timeout
        )

    except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
        # Fail silently if TTS encounters issues
        pass
    except Exception:
        # Fail silently for any other errors
        pass


def check_orchestrator_continue(input_data):
    """Check if the orchestrator should chain to the next task.

    Reads the transcript to detect [ORCHESTRATOR:CONTINUE] marker
    and manages the session counter.
    """
    if not os.environ.get("CLAUDE_ORCHESTRATOR_MODE"):
        return False

    # Check transcript for continuation signal
    transcript_path = input_data.get("transcript_path")
    if not transcript_path or not os.path.exists(transcript_path):
        return False

    try:
        with open(transcript_path, "r") as f:
            content = f.read()
        if "[ORCHESTRATOR:CONTINUE]" not in content:
            return False
    except Exception:
        return False

    # Manage session counter
    counter_file = os.path.expanduser("~/.claude/orchestrator-session-count")
    max_sessions = int(os.environ.get("ORCHESTRATOR_MAX_SESSIONS", "10"))

    try:
        if os.path.exists(counter_file):
            with open(counter_file, "r") as f:
                count = int(f.read().strip())
        else:
            count = 0
    except (ValueError, OSError):
        count = 0

    count += 1

    if count >= max_sessions:
        # Reset counter and stop
        try:
            os.remove(counter_file)
        except OSError:
            pass
        return False

    # Write updated counter
    try:
        with open(counter_file, "w") as f:
            f.write(str(count))
    except OSError:
        pass

    return True


def chain_next_session():
    """Spawn a new Claude Code session to continue the orchestrator queue."""
    try:
        subprocess.Popen(
            ["claude", "-p", "/orchestrate", "--dangerously-skip-permissions"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    except Exception:
        pass


def reset_orchestrator_counter():
    """Reset the session counter when orchestrator finishes."""
    counter_file = os.path.expanduser("~/.claude/orchestrator-session-count")
    try:
        if os.path.exists(counter_file):
            os.remove(counter_file)
    except OSError:
        pass


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument("--chat", action="store_true", help="Copy transcript to chat.json")
        parser.add_argument("--chain", action="store_true", help="Enable orchestrator chaining")
        args = parser.parse_args()

        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Ensure log directory exists
        log_dir = os.path.join(os.getcwd(), "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_path = os.path.join(log_dir, "stop.json")

        # Read existing log data or initialize empty list
        if os.path.exists(log_path):
            with open(log_path, "r") as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []

        # Append new data with timestamp
        input_data["timestamp"] = datetime.now().isoformat()
        log_data.append(input_data)

        # Write back to file with formatting
        with open(log_path, "w") as f:
            json.dump(log_data, f, indent=2)

        # Handle --chat switch
        if args.chat and "transcript_path" in input_data:
            transcript_path = input_data["transcript_path"]
            if os.path.exists(transcript_path):
                # Read .jsonl file and convert to JSON array
                chat_data = []
                try:
                    with open(transcript_path, "r") as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                try:
                                    chat_data.append(json.loads(line))
                                except json.JSONDecodeError:
                                    pass  # Skip invalid lines

                    # Write to logs/chat.json
                    chat_file = os.path.join(log_dir, "chat.json")
                    with open(chat_file, "w") as f:
                        json.dump(chat_data, f, indent=2)
                except Exception:
                    pass  # Fail silently

        # Handle orchestrator chaining (with throttle)
        if args.chain and check_orchestrator_continue(input_data):
            # Check resource throttle before chaining
            throttle_delay = 0
            throttle_stop = False
            try:
                result = subprocess.run(
                    ["uv", "run", "--no-project",
                     os.path.expanduser("~/.claude/hooks/utils/throttle.py"), "--json"],
                    capture_output=True, text=True, timeout=15,
                )
                if result.returncode == 0:
                    decision = json.loads(result.stdout)
                    throttle_delay = decision.get("delay_seconds", 0)
                    throttle_stop = decision.get("should_stop", False)
            except Exception:
                pass  # If throttle fails, proceed without it

            if throttle_stop:
                # Throttle says stop — don't chain
                reset_orchestrator_counter()
            else:
                # Apply delay then chain
                if throttle_delay > 0:
                    import time
                    time.sleep(throttle_delay)
                chain_next_session()
        elif args.chain and os.environ.get("CLAUDE_ORCHESTRATOR_MODE"):
            # Orchestrator is done (no more tasks or hit cap)
            reset_orchestrator_counter()

        # Emit trace event for observatory
        try:
            from pathlib import Path
            trace_dir = Path.home() / ".claude" / "traces"
            trace_dir.mkdir(parents=True, exist_ok=True)
            trace_file = trace_dir / "events.jsonl"
            trace_event = {
                "ts": datetime.now().isoformat(),
                "type": "agent_completed",
                "trace_id": os.environ.get("CLAUDE_SESSION_ID", "unknown"),
                "parent_id": os.environ.get("CLAUDE_PARENT_SESSION_ID"),
                "agent": os.environ.get("CLAUDE_AGENT_NAME", "main"),
                "cwd": os.getcwd(),
                "data": {"detail": "Session ended"},
            }
            with open(trace_file, "a") as tf:
                tf.write(json.dumps(trace_event) + "\n")
        except Exception:
            pass

        # Announce completion via TTS
        announce_completion()

        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == "__main__":
    main()
