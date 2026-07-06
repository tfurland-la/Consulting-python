"""Offline SDK fakes for Exercise 1 — Claude-owned scaffolding.

Factories that mimic the shape of Anthropic SDK response objects closely
enough for loop tests, plus a FakeClient that replays a scripted sequence of
messages and records every request. Pure plumbing: nothing here implements
any loop, retry, or enforcement logic.
"""

import types


def make_text_block(text):
    return types.SimpleNamespace(type="text", text=text)


def make_tool_use_block(name, tool_input, block_id):
    return types.SimpleNamespace(type="tool_use", name=name, input=tool_input, id=block_id)


def make_message(stop_reason, content):
    """content: list of blocks from the factories above."""
    return types.SimpleNamespace(stop_reason=stop_reason, content=content, role="assistant")


class FakeClient:
    """Replays scripted messages in order; records create() kwargs.

    fake = FakeClient(scripted=[msg1, msg2])
    fake.messages.create(...)  -> msg1   (kwargs recorded in fake.requests[0])
    fake.messages.create(...)  -> msg2
    A third call raises IndexError — a scripted conversation that runs past
    its script is a test bug worth failing loudly on.
    """

    def __init__(self, scripted):
        self._scripted = list(scripted)
        self.requests = []
        self.messages = types.SimpleNamespace(create=self._create)

    def _create(self, **kwargs):
        self.requests.append(kwargs)
        if not self._scripted:
            raise IndexError("FakeClient script exhausted — test scripted too few messages")
        return self._scripted.pop(0)
