from lesson5 import chat

def test_chat():
    response1 = chat("What is a Python list?")
    assert "list" in response1.lower()

    response2 = chat("How is it different from a tuple?")
    assert "tuple" in response2

    response3 = chat("Which one would I use for a Claude API messages history?")
    assert "list" in response3.lower()