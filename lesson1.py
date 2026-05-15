class EngagementAnalyzer:
    def __init__(self, client_name, team_size):
        self.client_name = client_name
        self.team_size = team_size
        

    def get_summary(self):
        # Placeholder for analysis logic
        if self.team_size > 10:
            return f"{self.client_name} is a large engagement ({self.team_size} people)"
        else:
            return f"{self.client_name} is a small engagement ({self.team_size} people)"
        

analyzer = EngagementAnalyzer("Acme Corp", 15)
print(analyzer.get_summary())

analyzer_2 = EngagementAnalyzer("Wayne Enterprises", 4)
print(analyzer_2.get_summary())
print(analyzer.get_summary())