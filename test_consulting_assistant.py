from consulting_assistant import chat

def test_chat():
    response1 = chat("A client's order fulfillment process has a 3-day cycle time. Their competitor is at 1 day. Where do I start?")
    assert "Python" not in response1
    assert any(line.strip().startswith(("1.", "2.", "-", "*", "•")) for line in response1.splitlines())
    assert len(response1.strip().splitlines()) > 3
    assert any(word in response1.lower() for word in ["process", "step", "assess", "analyze"])
    assert len(response1) > 100
    assert "\n" in response1
