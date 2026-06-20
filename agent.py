"""
agent.py — LLM agent loop for DecisionTwin.

Wraps the Anthropic Python SDK and runs the tool-use agentic loop.
The agent is given a `search` tool backed by data.py, with a tool list
designed to be extended easily.

Usage:
    from agent import run_agent
    final_answer = run_agent(prompt="Your research question or spec text here")
"""

from __future__ import annotations

import json
import os
from typing import Any

import anthropic

import data as data_module

# ---------------------------------------------------------------------------
# Model config
# ---------------------------------------------------------------------------

MODEL = "claude-opus-4-5"
MAX_TOKENS = 4096

# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------
# Each entry follows the Anthropic tool schema.
# Add new tools here and register a handler in TOOL_HANDLERS below.

TOOLS: list[dict[str, Any]] = [
    {
        "name": "search",
        "description": (
            "Search the data corpus for information relevant to the given query. "
            "Returns matching paragraphs (or the full corpus if nothing specific matches). "
            "Use this tool whenever you need factual information from the data."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "A natural-language search query describing what to look for.",
                }
            },
            "required": ["query"],
        },
    },
]


def _handle_search(tool_input: dict[str, Any]) -> str:
    query = tool_input.get("query", "")
    return data_module.search(query)


# Map tool name → handler function
TOOL_HANDLERS: dict[str, Any] = {
    "search": _handle_search,
}


# ---------------------------------------------------------------------------
# Agent loop
# ---------------------------------------------------------------------------

def run_agent(
    prompt: str,
    system: str | None = None,
    *,
    verbose: bool = False,
) -> str:
    """Run the agentic tool-use loop and return the final text response.

    Args:
        prompt:  The user-facing task / research spec.
        system:  Optional system prompt.  If None, a sensible default is used.
        verbose: If True, print each step to stdout for debugging.

    Returns:
        The final text answer produced by the model after all tool calls.
    """
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    if system is None:
        system = (
            "You are DecisionTwin, a research and synthesis agent. "
            "You have access to a `search` tool that queries a data corpus. "
            "Use it as many times as needed to thoroughly answer the user's spec. "
            "When you have gathered enough information, write a comprehensive, "
            "well-structured report as your final response."
        )

    messages: list[dict[str, Any]] = [
        {"role": "user", "content": prompt},
    ]

    if verbose:
        print(f"[agent] Starting loop. Model: {MODEL}")

    # Agentic loop — keep going until the model stops requesting tool calls
    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system,
            tools=TOOLS,  # type: ignore[arg-type]
            messages=messages,  # type: ignore[arg-type]
        )

        if verbose:
            print(f"[agent] stop_reason={response.stop_reason}, "
                  f"content blocks={len(response.content)}")

        # Append the assistant's response to the conversation
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Extract the final text block
            text_blocks = [
                block.text for block in response.content
                if hasattr(block, "text")
            ]
            return "\n".join(text_blocks).strip()

        if response.stop_reason == "tool_use":
            # Execute each requested tool and collect results
            tool_results = []
            for block in response.content:
                if block.type != "tool_use":
                    continue

                tool_name = block.name
                tool_input = block.input  # already a dict

                if verbose:
                    print(f"[agent] Tool call: {tool_name}({json.dumps(tool_input)})")

                handler = TOOL_HANDLERS.get(tool_name)
                if handler is None:
                    result_content = f"[error] Unknown tool: {tool_name}"
                else:
                    try:
                        result_content = handler(tool_input)
                    except Exception as exc:  # noqa: BLE001
                        result_content = f"[error] Tool raised exception: {exc}"

                if verbose:
                    preview = result_content[:120].replace("\n", " ")
                    print(f"[agent] Tool result preview: {preview}…")

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result_content,
                })

            # Feed tool results back to the model
            messages.append({"role": "user", "content": tool_results})
            continue  # next iteration

        # Unexpected stop reason — bail out with whatever text we have
        text_blocks = [
            block.text for block in response.content
            if hasattr(block, "text")
        ]
        return "\n".join(text_blocks).strip() or f"[agent] Stopped unexpectedly: {response.stop_reason}"
