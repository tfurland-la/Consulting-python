"""Phase 5 live gate — multi-concern decomposition + structured handoff.
Claude-owned harness.

One message, three concerns, with a backend failure armed mid-flight. Prints
the tool trace and then YOUR build_escalation_handoff() output. Gate: a
human with no transcript access could act on the handoff alone.

Cost: one multi-turn conversation — cents. Run:
    .venv/bin/python exercises/exercise1/check_p5_handoff.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from anthropic import Anthropic
from dotenv import load_dotenv

import mock_backend
import support_agent

MULTI_CONCERN = (
    "Hi, I'm Sarah Chen (CUST-1001). Three things: my chair from ORD-1002 "
    "arrived with a cracked base and I want a refund; I need my shipping "
    "address changed for future orders; and honestly this is the third "
    "delivery problem this year — someone should hear about it."
)


def main():
    load_dotenv()
    client = Anthropic()
    # Arm one transient failure so a concern wobbles mid-flight; your loop's
    # retry/wrapping behavior determines what the handoff reports.
    mock_backend.set_failure_mode("transient")
    history = support_agent.run_agent(MULTI_CONCERN, client=client)

    print("=== Tool trace")
    for turn in history:
        content = turn["content"]
        if isinstance(content, list):
            for block in content:
                btype = getattr(block, "type", None) or (block.get("type") if isinstance(block, dict) else None)
                if btype == "tool_use":
                    name = getattr(block, "name", None) or block.get("name")
                    print(f"  {name}: {getattr(block, 'input', None) or block.get('input')}")

    print("\n=== Handoff")
    handoff = support_agent.build_escalation_handoff(history)
    print(json.dumps(handoff, indent=2, default=str))
    print(
        "\nGate: identity, root cause, attempted actions with amounts, and a"
        "\nrecommended action — all present, no transcript needed."
    )


if __name__ == "__main__":
    main()
