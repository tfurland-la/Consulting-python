"""Mock research tools for Exercise 4 — Claude-owned scaffolding.

A keyword search over the fixture corpus plus a timeout-injection switch.
The D5.6 fixture is baked into the corpus: article_03 (2024-05) and
article_07 (2025-11) report DIFFERENT values for the same remote-share
statistic — your synthesis must surface both, attributed and dated.

No retry logic lives here: raising is the scaffold's job, recovering is
yours (research_pipeline.py).
"""

import json
from pathlib import Path

_CORPUS = json.loads((Path(__file__).parent / "fixtures" / "corpus.json").read_text())
_BY_ID = {a["article_id"]: a for a in _CORPUS}


class SearchTimeoutError(TimeoutError):
    """Simulated search-backend timeout."""


# set_timeout_injection(2) makes the SECOND search_articles call raise, then
# the switch clears. times=2 makes calls N and N+1 both raise — so "retry
# once succeeds" (times=1) and "retries exhausted" (times=2) are both
# constructible.
_INJECTION = {"on_call": None, "times": 1, "calls_seen": 0}


def set_timeout_injection(on_call, times=1):
    """Arm timeouts on the Nth (1-based) subsequent search call and the
    times-1 calls after it; None disarms. The call counter resets whenever
    you (re)arm."""
    _INJECTION["on_call"] = on_call
    _INJECTION["times"] = times
    _INJECTION["calls_seen"] = 0


def search_articles(query):
    """Naive keyword search: returns articles whose title or text contains
    any whitespace-separated term of the query (case-insensitive)."""
    _INJECTION["calls_seen"] += 1
    armed = _INJECTION["on_call"]
    if armed is not None and armed <= _INJECTION["calls_seen"] < armed + _INJECTION["times"]:
        if _INJECTION["calls_seen"] == armed + _INJECTION["times"] - 1:
            _INJECTION["on_call"] = None  # window exhausted; disarm
        raise SearchTimeoutError("search backend timed out")
    terms = [t.lower() for t in query.split() if t.strip()]
    hits = []
    for article in _CORPUS:
        haystack = (article["title"] + " " + article["text"]).lower()
        if any(term in haystack for term in terms):
            hits.append(article)
    return hits


def get_article(article_id):
    """Full article record, or None."""
    return _BY_ID.get(article_id)
