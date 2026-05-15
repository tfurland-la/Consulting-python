from lesson1 import EngagementAnalyzer


def test_large_engagement():
    analyzer = EngagementAnalyzer("Acme Corp", 15)
    assert analyzer.get_summary() == "Acme Corp is a large engagement (15 people)"


def test_small_engagement():
    analyzer = EngagementAnalyzer("Wayne Enterprises", 4)
    assert analyzer.get_summary() == "Wayne Enterprises is a small engagement (4 people)"


def test_boundary():
    analyzer = EngagementAnalyzer("Boundary Co", 10)
    assert analyzer.get_summary() == "Boundary Co is a small engagement (10 people)"
