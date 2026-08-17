import os

import pytest
from dotenv import load_dotenv

# lesson5 builds its Anthropic client at import scope, so importing it without a
# key raises TypeError before any test runs. That is a COLLECTION error, and a
# collection error aborts the whole pytest run rather than this one file — on a
# machine with no .env it takes every other test down with it. Load the same
# .env lesson5 does, then skip at module level if there is still no key.
load_dotenv()

if not os.environ.get("ANTHROPIC_API_KEY"):
    pytest.skip(
        "no ANTHROPIC_API_KEY — lesson5 calls the real API. Create a .env file "
        "at the repo root containing ANTHROPIC_API_KEY=sk-... (it is "
        "gitignored); see the README for where to get a key.",
        allow_module_level=True,
    )

from lesson5 import chat  # noqa: E402 — must come after the skip above


def test_chat():
    """Multi-turn conversation: each answer should build on the last.

    Assertions are deliberately loose. This calls the live API, so the exact
    wording varies between runs — an earlier version asserted the literal word
    "tuple" and failed when the model answered the tuple question in terms of
    mutability instead. Assert the shape of a good answer, not one phrasing.
    """
    response1 = chat("What is a Python list?")
    assert "list" in response1.lower()

    response2 = chat("How is it different from a tuple?")
    assert any(word in response2.lower() for word in ("tuple", "immutable", "mutable"))

    response3 = chat("Which one would I use for a Claude API messages history?")
    assert "list" in response3.lower()
