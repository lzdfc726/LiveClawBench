---
name: report-renderer
description: Reporting stage — aggregates statistics by group and writes formatted output reports.
version: 1.0.0
---

# Report Renderer

## Skill Summary

The reporting stage of the report-generator-pipeline. Computes aggregate statistics
(mean, median, sum, count, min, max) grouped by a specified column, then formats
and writes the final report in CSV or JSON format.

## Sub-Modules

| Directory            | Script          | Description                                     |
| -------------------- | --------------- | ----------------------------------------------- |
| `stats-aggregator/`  | `aggregator.py` | Group-by aggregation with configurable metrics  |
| `format-writer/`     | `writer.py`     | Format and write final report file              |

## Available Statistics

The stats-aggregator computes the following metrics per group:

- **mean**: Arithmetic mean of values
- **median**: Middle value (50th percentile)
- **sum**: Total of all values
- **count**: Number of records
- **min**: Minimum value
- **max**: Maximum value

These six metrics are the complete set available for aggregation.

## Stats Report JSON Schema

The stats-aggregator produces a JSON file with this structure:

```json
{
  "group_column": "<column_name>",
  "groups": {
    "<group_value>": {
      "mean": <float>,
      "median": <float>,
      "sum": <float>,
      "count": <int>,
      "min": <float>,
      "max": <float>
    },
    ...
  }
}
```

The format-writer reads this schema and converts it to the final output format.

## Inputs

- `--input` / `-i`: Path to JSON records file (required)
- `--group-by` / `-g`: Column name to group by (required)
- `--metrics`: Comma-separated list of metrics to compute (default: all six)
- `--value-column` / `-v`: Column to aggregate (required)
- `--output-format` / `-f`: Output format: `csv` or `json` (default: `json`)
- `--output` / `-o`: Output directory (required)

## Output

- `stats_report.json`: Aggregated statistics (intermediate)
- `final_report.csv` or `final_report.json`: Formatted output report
