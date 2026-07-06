"""Phase 2 live gate — zero-shot vs few-shot comparison. Claude-owned harness.

Runs YOUR extract_contract_fields over the corpus twice (use_few_shot off,
then on) and prints extraction vs answer key side by side, per doc and
field. Deliberately computes NO accuracy numbers — building the two-view
accuracy table is Phase 4, and it stays yours.

Cost: 2 x 20 extraction calls over ~1k-char docs — some tens of cents.
The oversized doc is skipped here (it's Phase 3's batch-failure fixture).
Run:
    .venv/bin/python exercises/exercise3/run_p2_fewshot.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from anthropic import Anthropic
from dotenv import load_dotenv

import data
import extractor_pipeline

FIELDS = ["client_name", "contract_value", "currency", "start_date",
          "duration_weeks", "jurisdiction", "payment_terms"]


def main():
    load_dotenv()
    client = Anthropic()
    docs = data.load_docs()
    key = data.load_answer_key()
    docs.pop("doc_21_oversized")  # Phase 3's fixture, not Phase 2's

    for use_few_shot in (False, True):
        label = "FEW-SHOT" if use_few_shot else "ZERO-SHOT"
        print(f"\n{'=' * 20} {label} {'=' * 20}")
        for doc_id, text in sorted(docs.items()):
            extraction = extractor_pipeline.extract_contract_fields(
                text, client=client, use_few_shot=use_few_shot
            )
            expected = key[doc_id]["fields"]
            quirks = ", ".join(key[doc_id]["quirks"]) or "clean"
            print(f"\n--- {doc_id} ({quirks})")
            for field in FIELDS:
                got = extraction.get(field)
                want = expected[field]
                marker = " " if got == want else "!"
                print(f"  {marker} {field:16} got={got!r}  key={want!r}")

    print(
        "\nGate: log zero-shot failures BY FORMAT (table-only? informal"
        "\nduration?), target 2-4 few-shot examples at those formats, and"
        "\nre-run. Improvement on the failing formats — and null stays null"
        "\non absent fields in BOTH runs."
    )


if __name__ == "__main__":
    main()
