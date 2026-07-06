"""Fixture I/O for Exercise 3 — Claude-owned scaffolding. Pure loading, no
extraction or scoring logic."""

import json
from pathlib import Path

FIXTURES = Path(__file__).parent / "fixtures"


def load_docs():
    """{doc_id: full text} for every fixture document (incl. the oversized one)."""
    return {p.stem: p.read_text() for p in sorted((FIXTURES / "docs").glob("*.txt"))}


def load_answer_key():
    return json.loads((FIXTURES / "answer_key.json").read_text())


def load_synthetic_results():
    """Pre-baked extraction results for the phase-4 stratification exercise
    (lets the aggregate-trap test run offline, before your own batch run)."""
    return json.loads((FIXTURES / "synthetic_results.json").read_text())
