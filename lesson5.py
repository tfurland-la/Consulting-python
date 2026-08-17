from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic()

messages = []

def chat(user_message):
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a helpful Python tutor for a management consultant learning to build with the Claude API. Keep responses concise.",
        messages=messages,
    )

    assistant_message = response.content[0].text
    messages.append({"role": "assistant", "content": assistant_message})
    return assistant_message

# Only run the demo when this file is executed directly — `python3 lesson5.py`.
# Without this guard the three calls below fire on IMPORT, so merely importing
# `chat` (as test_lesson5.py does) spends three real API calls before the test
# has run a single line. consulting_assistant.py already guards its demo this
# way; this file was the exception.
if __name__ == "__main__":
    print(chat("What is a Python list?"))
    print(chat("How is it different from a tuple?"))
    print(chat("Which one would I use for a Claude API messages history?"))