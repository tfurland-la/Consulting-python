from lesson3 import calculate_utilization

def test_calculate_utilization_partial():
    assert calculate_utilization(32, 40) == 80.0

def test_calculate_utilization_full():
    assert calculate_utilization(40, 40) == 100.0

def test_calculate_utilization_zero():
    assert calculate_utilization(0, 40) == 0.0
