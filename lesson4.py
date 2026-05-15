import json

# Python dict
engagement = {
    "client": "Acme Corp",
    "team_size": 15,
    "active": True,
    "findings": ["Process gaps", "Legacy tech"]
}

# Convert dict to JSON string (serializing)
json_string = json.dumps(engagement)
print(type(json_string))
print(json_string)

# Convert JSON string back to dict (parsing)
parsed = json.loads(json_string)
print(type(parsed))
print(parsed["client"])

# Pretty printing - useful for debugging API responses
print(json.dumps(engagement, indent=2))

# writing JSON to a file
with open("engagement.json", "w") as f:
    json.dump(engagement, f, indent=2)

# reading JSON from a file
with open("engagement.json", "r") as f:
    loaded = json.load(f)

print(loaded["findings"])
