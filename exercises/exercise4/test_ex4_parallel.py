"""Phase 3 skeletons — parallel delegation. YOU write every assertion.

The mechanical insight to internalize: parallel delegation is the
coordinator issuing multiple Task calls in one turn — your implementation
mirrors that by dispatching both subagent calls before awaiting either.

Setup provides a SlowFakeClient whose create() sleeps, so wall-clock
comparison is meaningful offline.
"""

import time

import pytest

from mocks import FakeClient, make_message, make_text_block  # noqa: F401
import research_pipeline  # noqa: F401 — used by the assertions you will write


class SlowFakeClient(FakeClient):
    """FakeClient with an artificial per-call delay (seconds)."""

    def __init__(self, scripted, delay=0.15):
        super().__init__(scripted)
        self._delay = delay

    def _create(self, **kwargs):
        time.sleep(self._delay)
        return super()._create(**kwargs)


def test_parallel_beats_sequential_wall_clock():
    """GATE (Phase 3): with two subagent calls at ~0.15s each,
    run_pipeline(parallel=True) completes measurably faster than
    parallel=False. Assert a conservative margin, not an exact ratio —
    CI boxes jitter."""
    pytest.fail("SCAFFOLD-TODO: time both modes; parallel < sequential by a clear margin")


def test_parallel_and_sequential_agree():
    """GATE (Phase 3): both modes produce the same findings set (order may
    differ; content may not)."""
    pytest.fail("SCAFFOLD-TODO: same findings either way — parallelism changes time, not truth")
