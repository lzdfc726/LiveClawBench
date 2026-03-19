---
name: stats-aggregator
description: Compute aggregate statistics (mean, median, sum, count, min, max) grouped by a column.
version: 1.0.0
---

# Stats Aggregator

## Skill Summary

Groups records by a specified column and computes configurable aggregate statistics on a
numeric value column. Supports six standard statistical metrics: mean, median, sum, count,
min, and max.

## Inputs

- `--input` / `-i`: Path to JSON records file (required)
- `--group-by` / `-g`: Column name to group records by (required)
- `--value-column` / `-v`: Numeric column to aggregate (required)
- `--metrics`: Comma-separated metrics to compute (default: `mean,median,sum,count,min,max`)
- `--output` / `-o`: Output directory (required)

## Available Metrics

| Metric   | Description                | Python Function        |
| -------- | -------------------------- | ---------------------- |
| `mean`   | Arithmetic mean            | `statistics.mean()`    |
| `median` | Middle value               | `statistics.median()`  |
| `sum`    | Sum of all values          | `sum()`                |
| `count`  | Number of records          | `len()`                |
| `min`    | Minimum value              | `min()`                |
| `max`    | Maximum value              | `max()`                |

## Processing Steps

1. Load JSON records from input file
2. Group records by the specified column
3. For each group, extract the value column as a list of floats
4. Compute each requested metric
5. Write results to `stats_report.json`

## Output

- `stats_report.json` with structure:
  ```json
  {
    "group_column": "region",
    "groups": {
      "North": {"mean": 150.5, "median": 140.0, "sum": 3010, "count": 20, "min": 80, "max": 250},
      "South": {"mean": 120.3, ...}
    }
  }
  ```

## Implementation

- Command: `python3 stats-aggregator/aggregator.py -i <file> -g region -v revenue -o <dir>`
- Dependencies: Python standard library (`json`, `statistics`, `argparse`, `os`)
