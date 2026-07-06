"""Live harness for Exercise 4 — Claude-owned. Drives YOUR pipeline in the
modes each phase gates on.

    .venv/bin/python exercises/exercise4/run_pipeline.py                 # phases 1/2/5 eyeballing
    .venv/bin/python exercises/exercise4/run_pipeline.py --parallel      # phase 3 (prints both timings)
    .venv/bin/python exercises/exercise4/run_pipeline.py --inject-timeout  # phase 4 (diff vs clean run)
    .venv/bin/python exercises/exercise4/run_pipeline.py --show-prompts  # phase 2 grep gate

Cost per run: one coordinator + two subagents + synthesis — cents.
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from anthropic import Anthropic
from dotenv import load_dotenv

import mock_tools
import research_pipeline

QUESTION = "How has flexible work reshaped where and how knowledge work happens?"
CONFLICT_QUESTION = "What share of knowledge workers are remote, and is it changing?"


def main():
    load_dotenv()
    client = Anthropic()
    args = set(sys.argv[1:])

    if "--show-prompts" in args:
        # Phase 2 gate helper: print the subagent briefs the coordinator
        # builds, so you can confirm context passes ONLY through prompts.
        subtasks = research_pipeline.decompose(QUESTION, client=client)
        print("=== Decomposition")
        for subtask in subtasks:
            print(f"  {subtask}")
        return

    if "--parallel" in args:
        for parallel in (False, True):
            start = time.perf_counter()
            research_pipeline.run_pipeline(QUESTION, client=client, parallel=parallel)
            elapsed = time.perf_counter() - start
            print(f"parallel={parallel}: {elapsed:.1f}s")
        print("\nGate: parallel dispatch beats sequential wall-clock.")
        return

    if "--inject-timeout" in args:
        # Two consecutive timeouts: the first search fails, your one local
        # retry also fails, and the structured-error / coverage-annotation
        # path engages.
        mock_tools.set_timeout_injection(1, times=2)
        report = research_pipeline.run_pipeline(QUESTION, client=client)
        print(report)
        print("\nGate: diff this against a clean run — PARTIAL / NOT COVERED"
              "\nannotations visible, missing source named, no silent completeness.")
        return

    question = CONFLICT_QUESTION if "--conflict" in args else QUESTION
    report = research_pipeline.run_pipeline(question, client=client)
    print(report)
    if "--conflict" in args:
        print("\nGate: both 42% (2024-05) and 31% (2025-11) present, attributed,"
              "\ndated — not averaged, not recency-picked, not dropped.")


if __name__ == "__main__":
    main()
