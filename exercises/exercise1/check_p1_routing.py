"""Phase 1 live gate — tool-selection routing. Claude-owned harness.

Sends five ambiguous prompts through ONE API call each with
tool_choice='auto' against YOUR TOOLS and SYSTEM_PROMPT, and prints which
tool the model picked. If routing fails, fix the DESCRIPTIONS — not the
prompt. That's the D2.1 lesson enacted.

Cost: five short calls — cents at most. Needs ANTHROPIC_API_KEY in the
repo-root .env. Run:
    .venv/bin/python exercises/exercise1/check_p1_routing.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from anthropic import Anthropic
from dotenv import load_dotenv

import support_agent

# Verify against current docs before a session; never trust a memorized string.
MODEL = "claude-sonnet-5"

# Each prompt is ambiguous on purpose; the annotation names the plausible
# candidates a confused model might pick between.
PROMPTS = [
    ("check my order #12345", "lookup_order vs get_customer"),
    ("look up Sarah Chen", "get_customer vs lookup_order"),
    ("what's the status on my last purchase?", "lookup_order (may need get_customer first)"),
    ("can you pull up my account? I'm CUST-1004", "get_customer vs lookup_order"),
    ("I want my money back for ORD-1006", "process_refund vs lookup_order"),
]


def main():
    load_dotenv()
    if not support_agent.TOOLS:
        raise SystemExit("support_agent.TOOLS is empty — write your Phase 1 schemas first.")
    client = Anthropic()
    print(f"model={MODEL}  tool_choice=auto  prompts={len(PROMPTS)}\n")
    for prompt, candidates in PROMPTS:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=support_agent.SYSTEM_PROMPT,
            tools=support_agent.TOOLS,
            tool_choice={"type": "auto"},
            messages=[{"role": "user", "content": prompt}],
        )
        picked = [b.name for b in response.content if b.type == "tool_use"] or ["(no tool call)"]
        print(f"  {prompt!r}")
        print(f"    candidates: {candidates}")
        print(f"    model picked: {', '.join(picked)}\n")
    print("Gate: is every pick correct? If not — fix descriptions, rerun.")


if __name__ == "__main__":
    main()
