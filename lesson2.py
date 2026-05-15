# --- list ---
# An ordered collection. C# equivalent: List<object>

practice_areas = ["Management Consulting", "Software Engineering", "Product & Strategy"]

print(practice_areas[0])    # first item
print(practice_areas[-1])    # last item
print(len(practice_areas))    # count


# --- dict ---
# Key-value pairs. C# equivalent: Dictionary<string, object>

engagement = {
    "client": "Acme Corp",
    "team_size": 15,
    "active": True
}

print(engagement["client"])    # access by key
print(engagement["team_size"])    # returns an int
print(engagement["active"])    # returns a bool

response = {
    "content": [
        {"type": "text", "text": "Hello from Claude"}
    ]
}

print(response["content"][0]["text"])

engagement_report = {
    "client": "Acme Corp",
    "findings": [
        {"area": "Operations", "priority": "High", "note": "Process gaps in order fulfillment"},
        {"area": "Technology", "priority": "Medium", "note": "Legacy ERP creating bottlenecks"}
    ]
}

print(engagement_report["findings"][-1]["note"])

print(len([1, 2, 3]))
print(len("Hello"))
print(len({"a": 1, "b": 2}))

d = {"type": "text", "type": "image"}
print(d["type"])