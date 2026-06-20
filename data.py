"""
data.py — Data retrieval layer for DecisionTwin.

Exposes a top-level `search(query: str) -> str` function used by the agent.
Internally, search is delegated to the active DataSource implementation, making
it easy to swap in richer backends (vector DB, external APIs, etc.) without
touching any callers.
"""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from pathlib import Path


# ---------------------------------------------------------------------------
# DataSource abstraction
# ---------------------------------------------------------------------------

class DataSource(ABC):
    """Abstract base for all data backends.

    Any new data source (vector DB, REST API, SQL, …) should subclass this
    and implement `search`.  Register it with `set_source()` to activate it.
    """

    @abstractmethod
    def search(self, query: str) -> str:
        """Return a string containing the information relevant to *query*."""
        ...


# ---------------------------------------------------------------------------
# Built-in implementations
# ---------------------------------------------------------------------------

class MarkdownFileSource(DataSource):
    """Loads a Markdown file and returns matching paragraphs (or the whole file).

    MVP behaviour: split the file into paragraphs and return those that contain
    any word from the query (case-insensitive).  Falls back to the full file if
    nothing matches, so the agent always gets *something*.
    """

    def __init__(self, path: str | Path = "data.md") -> None:
        self.path = Path(path)

    def search(self, query: str) -> str:
        if not self.path.exists():
            return f"[DataSource] File not found: {self.path}"

        text = self.path.read_text(encoding="utf-8")
        if not text.strip():
            return "[DataSource] The data corpus is currently empty."

        # Simple paragraph-level keyword search
        keywords = [w.lower() for w in re.split(r"\W+", query) if len(w) > 2]
        paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]

        if not keywords:
            return text  # no useful keywords — return everything

        hits = [
            p for p in paragraphs
            if any(kw in p.lower() for kw in keywords)
        ]

        if hits:
            return "\n\n".join(hits)

        # Nothing matched — return the full file so the agent isn't left blind
        return text


class FullFileSource(DataSource):
    """Always returns the entire file, no filtering.  Useful for small corpora."""

    def __init__(self, path: str | Path = "data.md") -> None:
        self.path = Path(path)

    def search(self, query: str) -> str:  # noqa: ARG002
        if not self.path.exists():
            return f"[DataSource] File not found: {self.path}"
        text = self.path.read_text(encoding="utf-8")
        return text if text.strip() else "[DataSource] The data corpus is currently empty."


# ---------------------------------------------------------------------------
# Module-level registry
# ---------------------------------------------------------------------------

_active_source: DataSource = MarkdownFileSource()


def set_source(source: DataSource) -> None:
    """Replace the active DataSource (call before first use)."""
    global _active_source
    _active_source = source


def get_source() -> DataSource:
    """Return the currently active DataSource."""
    return _active_source


def search(query: str) -> str:
    """Top-level search function used by the agent tool.

    Delegates to whichever DataSource is currently registered.
    """
    return _active_source.search(query)
