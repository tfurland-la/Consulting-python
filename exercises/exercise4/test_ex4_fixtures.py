"""Scaffold-integrity tests — Claude-owned, and they should stay GREEN."""

import json
from pathlib import Path

import pytest

import mock_tools

REQUIRED_FIELDS = {"article_id", "title", "text", "source_name", "url", "publication_date"}


def _corpus():
    return json.loads((Path(__file__).parent / "fixtures" / "corpus.json").read_text())


def test_corpus_has_ten_complete_articles():
    corpus = _corpus()
    assert len(corpus) == 10
    for article in corpus:
        assert REQUIRED_FIELDS <= set(article)
        assert article["text"].strip()


def test_exactly_one_conflicting_statistic_pair():
    """article_03 and article_07 report different values for the same
    remote-share statistic, with different publication dates — the D5.6
    fixture the conflict phase depends on."""
    by_id = {a["article_id"]: a for a in _corpus()}
    a, b = by_id["article_03"], by_id["article_07"]
    assert "42%" in a["title"] + a["text"]
    assert "31%" in b["title"] + b["text"]
    assert a["publication_date"] != b["publication_date"]
    assert a["source_name"] == b["source_name"]  # same panel, later wave


def test_search_finds_the_conflict_pair():
    hits = {a["article_id"] for a in mock_tools.search_articles("remote knowledge workers share")}
    assert {"article_03", "article_07"} <= hits


def test_timeout_injection_raises_on_nth_call_then_clears():
    mock_tools.set_timeout_injection(2)
    mock_tools.search_articles("hybrid")  # call 1: fine
    with pytest.raises(mock_tools.SearchTimeoutError):
        mock_tools.search_articles("hybrid")  # call 2: armed
    mock_tools.search_articles("hybrid")  # cleared again


def test_timeout_injection_times_covers_the_retry_window():
    mock_tools.set_timeout_injection(1, times=2)
    with pytest.raises(mock_tools.SearchTimeoutError):
        mock_tools.search_articles("hybrid")  # first attempt
    with pytest.raises(mock_tools.SearchTimeoutError):
        mock_tools.search_articles("hybrid")  # the local retry also fails
    assert mock_tools.search_articles("hybrid")  # disarmed after the window


def test_get_article_returns_none_for_unknown_id():
    assert mock_tools.get_article("article_99") is None
    assert mock_tools.get_article("article_05")["source_name"] == "Main Street Economics"
