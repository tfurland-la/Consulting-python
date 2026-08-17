import os

import pytest
from dotenv import load_dotenv

# This test calls the real Anthropic API. Load the same .env the module does,
# then skip at module level when there is still no key. A learner who has cloned
# the repo but not yet added their key should be told exactly that, rather than
# shown an authentication traceback from inside the SDK.
load_dotenv()

if not os.environ.get("ANTHROPIC_API_KEY"):
    pytest.skip(
        "no ANTHROPIC_API_KEY — this test calls the real API. Create a .env "
        "file at the repo root containing ANTHROPIC_API_KEY=sk-... (it is "
        "gitignored); see the README for where to get a key.",
        allow_module_level=True,
    )

from consulting_assistant import chat  # noqa: E402 — must come after the skip above

def test_chat():
    response1 = chat("A client's order fulfillment process has a 3-day cycle time. Their competitor is at 1 day. Where do I start?")
    assert "Python" not in response1
    assert any(line.strip().startswith(("1.", "2.", "-", "*", "•")) for line in response1.splitlines())
    assert len(response1.strip().splitlines()) > 3
    assert any(word in response1.lower() for word in ["process", "step", "assess", "analyze"])
    assert len(response1) > 100
    assert "\n" in response1
