import json
from lesson4 import engagement

def test_dump_dict_to_string():
    json_string = json.dumps(engagement)
    assert isinstance(json_string, str)

def test_load_string_to_dict():
    json_string = json.dumps(engagement)
    parsed = json.loads(json_string)
    assert isinstance(parsed, dict)

def test_round_trip_dict():
    json_string = json.dumps(engagement)
    parsed = json.loads(json_string)
    assert parsed == engagement

