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

print(chat("What is a Python list?"))
print(chat("How is it different from a tuple?"))
print(chat("Which one would I use for a Claude API messages history?"))