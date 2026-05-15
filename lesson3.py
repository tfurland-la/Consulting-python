# --- functions ---


def calculate_utilization(billable_hours, total_hours):
    return billable_hours / total_hours * 100


print(calculate_utilization(32, 40))
print(calculate_utilization(25, 40))


# --- loops ---


consultants = [
    {"name": "Tom", "billable_hours": 32, "total_hours": 40},
    {"name": "Sarah", "billable_hours": 25, "total_hours": 40},
    {"name": "Marcus", "billable_hours": 28, "total_hours": 40}
]

for consultant in consultants:
    utilization = calculate_utilization(consultant["billable_hours"], consultant["total_hours"])
    print(f"{consultant['name']}: {utilization:.1f}%")