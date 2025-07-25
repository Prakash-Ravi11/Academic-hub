# Brython will run this in browser

def process_timetable(data):
    # Example: Calculate total credits
    total_credits = sum(subject['credits'] for subject in data)
    print(f"Total Credits: {total_credits}")
    return total_credits

# Example data from timetable
timetable = [
    {"name": "Boundary Value Problems", "credits": 4},
    {"name": "Data Structures and Algorithms", "credits": 4},
    # Add all subjects
]

process_timetable(timetable)

# TensorFlow Integration (via TensorFlow.js in JS, simulate here if needed)
# For advanced ML, use TensorFlow.js directly in JS
