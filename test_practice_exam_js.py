"""Runs the node-based tests for the practice exam's adaptive core, and checks
that the JS and Python task-statement catalogs stay in sync."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from test_practice_exam_bank import exam_lib

PRACTICE_EXAM_DIR = Path(__file__).parent / "practice-exam"

node = shutil.which("node")
pytestmark = pytest.mark.skipif(node is None, reason="node is not installed")


def test_adaptive_js_suite_passes():
    result = subprocess.run(
        [node, "--test", str(PRACTICE_EXAM_DIR / "adaptive.test.js")],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, f"node --test failed:\n{result.stdout}\n{result.stderr}"


def _dump_js_export(name):
    dump = subprocess.run(
        [
            node,
            "-e",
            "console.log(JSON.stringify(require("
            + json.dumps(str(PRACTICE_EXAM_DIR / "adaptive.js"))
            + f").{name}))",
        ],
        capture_output=True,
        text=True,
    )
    assert dump.returncode == 0, dump.stderr
    return json.loads(dump.stdout)


def test_js_task_statements_match_python():
    assert _dump_js_export("TASK_STATEMENTS") == exam_lib.TASK_STATEMENTS


def test_js_exam_form_quotas_match_python():
    assert _dump_js_export("EXAM_FORM_QUOTAS") == exam_lib.EXAM_FORM_QUOTAS


def test_js_scenario_types_match_python():
    """Block assembly needs the scenario list offline (the bank exam has no
    bridge), so it is duplicated in adaptive.js. Drift would silently produce
    blocks whose scenario type the generator then rejects."""
    assert _dump_js_export("SCENARIO_TYPES") == list(exam_lib.SCENARIO_TYPES)


def test_js_functional_fraction_matches_python():
    """A form and a bank refill must train the same mix."""
    assert _dump_js_export("FUNCTIONAL_FRACTION") == exam_lib.FUNCTIONAL_FRACTION


def test_js_primary_domain_map_names_real_domains():
    primary = _dump_js_export("SCENARIO_PRIMARY_DOMAINS")
    assert set(primary) == set(exam_lib.SCENARIO_TYPES)
    for scenario, domains in primary.items():
        for domain in domains:
            assert domain in exam_lib.DOMAINS, f"{scenario} names unknown {domain}"


def test_js_block_shape_matches_the_exam_form():
    """4 x 15 must equal the 60-question form, or a block draw silently
    under- or over-fills it."""
    blocks = _dump_js_export("EXAM_BLOCKS")
    size = _dump_js_export("EXAM_BLOCK_SIZE")
    assert blocks * size == sum(exam_lib.EXAM_FORM_QUOTAS.values()) == 60
