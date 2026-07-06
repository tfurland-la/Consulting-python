"""Exercise 3 — YOUR module: the Message Batches API lifecycle (Phase 3).

Submit → poll → partial failure → selective resubmission by custom_id.
Before submitting, do the SLA arithmetic on paper: results due 30 hours
after documents arrive, batch takes up to 24 — what's the submission
window? Record your answer in the debrief.
"""


def build_batch_requests(doc_ids):
    """Phase 3 — one batch request per document, each with a custom_id that
    lets you correlate results and target resubmissions."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 3")


def submit_and_wait(requests, client=None):
    """Phase 3 — submit the batch, poll until terminal, return results
    keyed by custom_id (including failures, distinguishably)."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 3")


def find_failed(results):
    """Phase 3 — the custom_ids that need resubmission."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 3")


def resubmit_failed(failed_ids, client=None):
    """Phase 3 — resubmit ONLY the failures, with the modification that
    lets them succeed (the oversized doc needs chunking)."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 3")
