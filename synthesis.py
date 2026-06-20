"""
synthesis.py — Main orchestrator for DecisionTwin.

Loads spec.md, runs the agent with the spec as the prompt, and writes the
agent's final output to report.md.

Run:
    uv run python synthesis.py [--verbose]
or (after `uv pip install -e .`):
    decisiontwin
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

# Load ANTHROPIC_API_KEY (and any other vars) from .env if present
load_dotenv()

import agent as agent_module  # noqa: E402  (after dotenv load)


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SPEC_PATH = Path("spec.md")
REPORT_PATH = Path("report.md")


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def run(*, verbose: bool = False) -> None:
    """Load the spec, run the agent, write the report."""

    # 1. Read the specification
    if not SPEC_PATH.exists():
        print(f"[synthesis] ERROR: {SPEC_PATH} not found. Create it first.", file=sys.stderr)
        sys.exit(1)

    spec_text = SPEC_PATH.read_text(encoding="utf-8").strip()
    if not spec_text:
        print(f"[synthesis] ERROR: {SPEC_PATH} is empty. Add your research spec.", file=sys.stderr)
        sys.exit(1)

    print(f"[synthesis] Loaded spec ({len(spec_text)} chars)")

    # 2. Run the agent
    print("[synthesis] Starting agent…")
    answer = agent_module.run_agent(prompt=spec_text, verbose=verbose)
    print(f"[synthesis] Agent finished ({len(answer)} chars in response)")

    # 3. Write report.md
    timestamp = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    report_content = f"# DecisionTwin Report\n\n_Generated: {timestamp}_\n\n---\n\n{answer}\n"
    REPORT_PATH.write_text(report_content, encoding="utf-8")
    print(f"[synthesis] Report written to {REPORT_PATH.resolve()}")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="DecisionTwin: run the agent synthesis pipeline."
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print agent step details to stdout.",
    )
    args = parser.parse_args()
    run(verbose=args.verbose)


if __name__ == "__main__":
    main()
