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


def test_js_task_statements_match_python():
    dump = subprocess.run(
        [
            node,
            "-e",
            "console.log(JSON.stringify(require("
            + json.dumps(str(PRACTICE_EXAM_DIR / "adaptive.js"))
            + ").TASK_STATEMENTS))",
        ],
        capture_output=True,
        text=True,
    )
    assert dump.returncode == 0, dump.stderr
    assert json.loads(dump.stdout) == exam_lib.TASK_STATEMENTS
