# Data Injection Scripts

Python scripts for injecting test data into the todo database for testing purposes.

## Two Injection Methods

1. **Automated Injection** (`inject_data.py`): Generate synthetic/random test data
2. **Manual Injection** (`inject_data_manual.py`): Define specific todo items in code

## Features

### Automated Injection (`inject_data.py`)
- **Multiple Injection Modes**: Random, category-specific, date-range, monthly distribution, and recurring patterns
- **Realistic Test Data**: Generates plausible titles, locations, persons, and descriptions
- **Flexible Configuration**: Control count, date ranges, categories, and patterns
- **Safe Operations**: Clear confirmation required before destructive operations

### Manual Injection (`inject_data_manual.py`)
- **Full Control**: Manually define each todo item's fields
- **Validation**: Automatic validation of date/time formats and required fields
- **Preview**: Review todos before injection
- **Flexible Definition**: Use dictionaries or helper functions

## Quick Start

### Automated Injection

```bash
# Navigate to backend directory
cd backend

# Inject 50 random todos
python inject_data.py --random 50

# View all options
python inject_data.py --help
```

### Manual Injection

```bash
# Navigate to backend directory
cd backend

# Edit inject_data_manual.py and define your todos in get_user_todos()
# Then run:
python inject_data_manual.py
```

## Usage Examples

### 1. Random Data Injection

Generate completely random todos for stress testing or general testing:

```bash
# Inject 50 random todos
python inject_data.py --random 50

# Inject 100 random todos (quiet mode)
python inject_data.py --random 100 --quiet
```

### 2. Category-Specific Injection

Generate todos from specific categories (work, personal, events, tasks):

```bash
# Inject 20 work-related todos
python inject_data.py --category work --count 20

# Inject 15 personal todos
python inject_data.py --category personal --count 15

# Inject 10 event todos
python inject_data.py --category events --count 10
```

### 3. Date Range Injection

Generate todos within a specific date range:

```bash
# Inject 30 todos across January 2024
python inject_data.py --date-range 2024-01-01 2024-01-31 --count 30

# Inject 25 todos in Q1 2024
python inject_data.py --date-range 2024-01-01 2024-03-31 --count 25
```

### 4. Monthly Distribution

Generate todos naturally distributed across a month (some days have more, some have none):

```bash
# Inject 40 todos distributed across March 2024
python inject_data.py --month 2024-03 --count 40

# Inject 60 todos for December 2024
python inject_data.py --month 2024-12 --count 60
```

### 5. Recurring Patterns

Generate recurring todo items for testing recurring event logic:

```bash
# 12 weekly team meetings starting Jan 1, 2024
python inject_data.py --recurring "Team Meeting" --start 2024-01-01 --frequency weekly --occurrences 12

# 30 daily standups
python inject_data.py --recurring "Daily Standup" --start 2024-01-01 --frequency daily --occurrences 30

# 6 monthly reviews
python inject_data.py --recurring "Monthly Review" --start 2024-01-01 --frequency monthly --occurrences 6
```

### 6. Database Management

```bash
# Clear all todos from database (requires confirmation)
python inject_data.py --clear
```

## Manual Data Injection

The `inject_data_manual.py` script allows you to define specific todo items directly in the code, giving you full control over each field.

### How to Use

1. **Edit the script**:
   ```bash
   # Open inject_data_manual.py in your editor
   nano inject_data_manual.py
   ```

2. **Define your todos** in the `get_user_todos()` function:
   ```python
   def get_user_todos() -> List[Dict[str, Any]]:
       """Define your custom todos here."""
       todos = [
           # Method 1: Using dictionaries
           {
               'title': 'Team Meeting',
               'date': '2024-03-15',
               'time': '10:00',
               'location': 'Conference Room A',
               'person': 'John Smith',
               'description': 'Weekly team sync'
           },

           # Method 2: Using the helper function
           create_todo(
               title='Doctor Appointment',
               date='2024-03-18',
               time='09:00',
               location='City Hospital',
               description='Annual checkup'
           ),

           # Add more todos...
       ]
       return todos
   ```

3. **Run the script**:
   ```bash
   python inject_data_manual.py
   ```

4. **Confirm injection** when prompted

### Field Reference

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `title` | Yes | String | `"Team Meeting"` |
| `date` | Yes | YYYY-MM-DD | `"2024-03-15"` |
| `time` | No | HH:MM | `"14:30"` |
| `location` | No | String | `"Conference Room A"` |
| `person` | No | String | `"John Smith"` |
| `description` | No | String | `"Weekly sync meeting"` |

### Example Scenarios

#### Creating a Daily Schedule

```python
todos = [
    {'title': 'Morning Standup', 'date': '2024-03-20', 'time': '09:00', 'location': 'Office'},
    {'title': 'Client Call', 'date': '2024-03-20', 'time': '11:00', 'person': 'Client Team'},
    {'title': 'Lunch Break', 'date': '2024-03-20', 'time': '12:00', 'location': 'Cafeteria'},
    {'title': 'Code Review', 'date': '2024-03-20', 'time': '14:00', 'person': 'Development Team'},
    {'title': 'Evening Wrap-up', 'date': '2024-03-20', 'time': '17:30'},
]
```

#### Creating an Event with Details

```python
todos = [
    {
        'title': 'Project Deadline',
        'date': '2024-03-31',
        'time': '18:00',
        'location': 'Main Office',
        'person': 'Project Team',
        'description': 'Final submission of Q1 deliverables. All documents must be reviewed and approved.'
    }
]
```

#### Using Helper Function for Cleaner Code

```python
todos = [
    create_todo('Meeting', '2024-03-15', '10:00', 'Office'),
    create_todo('Call', '2024-03-15', '14:00', person='Client'),
    create_todo('Review', '2024-03-16', description='Quarterly report'),
]
```

### Validation

The script automatically validates:
- Title is present and not empty
- Date format is YYYY-MM-DD
- Time format is HH:MM (if provided)
- All dates are valid calendar dates

Invalid todos will be skipped with an error message.

## Command Reference

| Argument | Description | Example |
|----------|-------------|---------|
| `--random COUNT` | Inject COUNT random todos | `--random 50` |
| `--category CAT` | Category: work, personal, events, tasks | `--category work` |
| `--count N` | Number of todos (default: 20) | `--count 30` |
| `--date-range START END` | Date range (YYYY-MM-DD) | `--date-range 2024-01-01 2024-01-31` |
| `--month YYYY-MM` | Distribute across month | `--month 2024-03` |
| `--recurring TITLE` | Recurring todo title | `--recurring "Team Meeting"` |
| `--start DATE` | Start date for recurring | `--start 2024-01-01` |
| `--frequency FREQ` | daily, weekly, monthly | `--frequency weekly` |
| `--occurrences N` | Number of occurrences | `--occurrences 12` |
| `--clear` | Delete all todos | `--clear` |
| `--quiet` | Suppress detailed output | `--quiet` |

## Use Cases

### Testing Calendar UI

```bash
# Create a busy month for UI testing
python inject_data.py --month 2024-03 --count 80
```

### Testing Date Range Queries

```bash
# Create specific date range data
python inject_data.py --date-range 2024-01-01 2024-01-31 --count 50
```

### Testing Recurring Logic

```bash
# Create various recurring patterns
python inject_data.py --recurring "Weekly Sync" --start 2024-01-01 --frequency weekly --occurrences 26
python inject_data.py --recurring "Daily Exercise" --start 2024-01-01 --frequency daily --occurrences 30
```

### Performance Testing

```bash
# Large dataset for performance testing
python inject_data.py --random 500 --quiet
```

### Category Testing

```bash
# Test different todo types
python inject_data.py --category work --count 30
python inject_data.py --category personal --count 20
python inject_data.py --category events --count 15
python inject_data.py --category tasks --count 25
```

## Implementation Details

### Data Generation

The script uses predefined pools of realistic data:
- **Titles**: Categorized into work, personal, events, and tasks
- **Locations**: Common places like offices, homes, public venues
- **Persons**: Realistic names and role-based references
- **Descriptions**: Common notes and priorities

### Randomization

- Time values: Random times between 6 AM and 9 PM, with 15-minute intervals
- Optional fields: 30-50% probability of being populated
- Dates: Configurable range with uniform distribution

### Database Safety

- Uses parameterized queries to prevent SQL injection
- Transaction-based commits for data integrity
- Confirmation required for destructive operations

## Integration with Testing

The script can be integrated into test suites:

```python
# Example test setup
import subprocess

def setup_test_data():
    # Clear existing data
    subprocess.run(['python', 'inject_data.py', '--clear'], cwd='backend')

    # Load specific test data
    subprocess.run([
        'python', 'inject_data.py',
        '--month', '2024-03',
        '--count', '50',
        '--quiet'
    ], cwd='backend')
```

## Extending the Script

### Adding New Categories

Edit the `DataGenerator.TITLES` dictionary:

```python
TITLES = {
    'work': [...],
    'personal': [...],
    'your_category': [
        "Your custom title 1",
        "Your custom title 2",
    ]
}
```

### Custom Data Pools

Modify `LOCATIONS`, `PERSONS`, or `DESCRIPTIONS` lists to match your application's context.

### Custom Patterns

Add new generation methods to the `DataGenerator` class:

```python
def generate_custom_pattern(self, ...):
    # Your custom logic
    return todos
```

## Troubleshooting

**Error: "Database locked"**
- Ensure no other process is using the database
- Stop the Flask application before running injection

**Error: "No such table: todos"**
- Initialize the database first: `python init_db.py`

**Unexpected data distribution**
- The script uses randomization; results vary between runs
- For reproducible results, set a fixed random seed in the script

## License

Part of the Todo List Web Application project.
