"""Phase 2 skeletons — schema nullability and few-shot design. YOU write
every assertion. Offline: these inspect YOUR schema and examples, not API
output (the live comparison is run_p2_fewshot.py).
"""

import pytest

import data
import extractor_pipeline  # noqa: F401 — used by the assertions you will write


def test_schema_marks_absent_fields_nullable():
    """GATE (Phase 2): fields that can legitimately be absent from a source
    document (the key has null contract_value and null jurisdiction cases)
    are nullable in CONTRACT_SCHEMA — a required field pressures the model
    to fabricate. Assert on the schema structure itself."""
    pytest.fail("SCAFFOLD-TODO: nullable where the corpus demands it")


def test_examples_are_valid_message_pairs():
    """GATE (Phase 2): each FEW_SHOT_EXAMPLES entry is a well-formed
    input/output demonstration (whatever pair-shape you chose), parseable
    and internally consistent."""
    pytest.fail("SCAFFOLD-TODO: every example validates against your pair shape")


def test_example_covers_table_only_format():
    """GATE (Phase 2): at least one example demonstrates extracting a value
    that appears ONLY in a table — the corpus has six such docs and
    zero-shot runs typically stumble on them."""
    pytest.fail("SCAFFOLD-TODO: a table-format demonstration exists")


def test_missing_jurisdiction_extracts_null_not_fabrication():
    """GATE (Phase 2, the D4.3/D4.4 boundary): for a doc whose key says
    jurisdiction is null (doc_03, doc_07, doc_13), your extraction returns
    null — before AND after few-shot. Offline version: assert your schema +
    examples never demonstrate inventing a jurisdiction; live version is
    the harness."""
    key = data.load_answer_key()
    null_docs = [d for d, e in key.items() if e["fields"]["jurisdiction"] is None]
    assert null_docs  # scaffold sanity: the cases exist
    pytest.fail("SCAFFOLD-TODO: null stays null; nothing demonstrates fabrication")
