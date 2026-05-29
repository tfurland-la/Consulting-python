from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic()

SYSTEM_PROMPT = """You are an AI assistant for LiminalArc, a management consulting firm.

Your role is to help consultants think through client problems with rigor and clarity.
You apply systems thinking and domain-driven approaches to analysis.
Keep responses concise and structured. Avoid generic advice — be specific and actionable."""

messages = []

def chat(user_message):
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=messages,
    )

    assistant_message = response.content[0].text
    messages.append({"role": "assistant", "content": assistant_message})
    return assistant_message

if __name__ == "__main__":
    print(chat("A client's order fulfillment process has a 3-day cycle time. Their competitor is at 1 day. Where do I start?"))