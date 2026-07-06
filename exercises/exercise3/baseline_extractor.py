from anthropic import Anthropic
from dotenv import load_dotenv
import json

load_dotenv()
client = Anthropic()


def extract_engagement_findings(notes: str) -> dict:
    """
    Extract structured findings from unstructured consulting meeting notes.
    Returns a dict with client, top_priority, actions, problems, and kpis.
    """
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": f"Extract the structured findings from these consulting notes:\n\n{notes}"
            }
        ],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "client": {"type": "string"},
                        "top_priority": {"type": "string"},
                        "actions": {"type": "array", "items": {"type": "string"}},
                        "problems": {"type": "array", "items": {"type": "string"}},
                        "kpis": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "current": {"type": "string"},
                                    "target": {"type": "string"}
                                },
                                "required": ["current", "target"],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": ["client", "top_priority", "actions", "problems", "kpis"],
                    "additionalProperties": False
                }
            }
        }
    )

    return json.loads(response.content[0].text)


def print_findings(data: dict) -> None:
    """Print structured findings in a readable format."""
    print(f"Company: {data['client']}")
    print(f"Priority: {data['top_priority']}")

    print("\nProblems:")
    for problem in data['problems']:
        print(f"  - {problem}")

    print("\nActions:")
    for action in data['actions']:
        print(f"  - {action}")

    print("\nKPIs:")
    for kpi in data['kpis']:
        print(f"  - Current: {kpi['current']}")
        print(f"    Target:  {kpi['target']}")


if __name__ == "__main__":
    sample_notes = """
    Meeting with Riverside Health System operations team. Key issues identified:
    - Patient discharge process averaging 4 hours, benchmark is 90 minutes
    - Three separate EHR systems not integrated, staff manually reconciling records
    - Nursing staff turnover at 34% annually, industry average is 22%
    - Finance team estimates manual reconciliation costs 2.3M annually
    - CEO wants a 90-day improvement roadmap
    Priority appears to be EHR integration based on downstream impact on both discharge time and staff burden.
    """

    findings = extract_engagement_findings(sample_notes)
    print_findings(findings)
