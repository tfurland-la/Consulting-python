"""Scaffold-integrity tests — Claude-owned, and they should stay GREEN."""

import data


def test_docs_and_key_are_paired():
    docs = data.load_docs()
    key = data.load_answer_key()
    assert len(docs) == 21
    assert set(docs) == set(key)


def test_engineered_variety_counts():
    key = data.load_answer_key()
    counts = {}
    for entry in key.values():
        for quirk in entry["quirks"]:
            counts[quirk] = counts.get(quirk, 0) + 1
    assert counts["table_only_value"] == 6
    assert counts["informal_duration"] == 4
    assert counts["missing_jurisdiction"] == 3
    assert counts["null_value"] == 2
    assert counts["oversized"] == 1


def test_exactly_two_internally_inconsistent_docs():
    key = data.load_answer_key()
    inconsistent = [d for d, e in key.items() if e["internally_inconsistent"]]
    assert len(inconsistent) == 2


def test_oversized_doc_is_actually_oversized():
    docs = data.load_docs()
    sizes = {d: len(t) for d, t in docs.items()}
    big = sizes.pop("doc_21_oversized")
    assert big > 50 * max(sizes.values())
    key = data.load_answer_key()
    assert key["doc_21_oversized"].get("expected_batch_failure") is True


def test_null_fields_are_really_null_in_the_key():
    key = data.load_answer_key()
    assert key["doc_12"]["fields"]["contract_value"] is None
    assert key["doc_03"]["fields"]["jurisdiction"] is None


def test_synthetic_results_cover_every_doc():
    results = data.load_synthetic_results()
    key = data.load_answer_key()
    assert set(results) == set(key)
    # The fixture is corrupted BY DESIGN: results must NOT all match the key,
    # or the phase-4 stratification exercise has nothing to find.
    mismatches = sum(
        1
        for doc_id, fields in results.items()
        for f, v in fields.items()
        if key[doc_id]["fields"][f] != v
    )
    assert mismatches >= 5
