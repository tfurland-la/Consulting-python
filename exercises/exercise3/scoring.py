"""Exercise 3 — YOUR module: the two-view accuracy table (Phase 4).

The aggregate-hides-the-stratum trap is the weakest of the new exam topics
— which is exactly why no counting logic is scaffolded here. Build both
views yourself against fixtures/answer_key.json.
"""


def accuracy_aggregate(results, key):
    """Phase 4 — one number: fraction of (doc, field) cells that match the
    answer key."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 4")


def accuracy_stratified(results, key):
    """Phase 4 — accuracy broken out by document type AND by field, so a
    healthy aggregate can't hide a failing stratum. Shape of the return
    value is your design; the gate is that the weak stratum is visible."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 4")
