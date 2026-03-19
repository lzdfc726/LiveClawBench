---
name: report-renderer
description: Reporting stage — aggregates statistics (including percentile and mode) by group with metadata, and writes formatted output reports.
version: 1.1.0
---

# Report Renderer

## Skill Summary

The reporting stage of the report-generator-pipeline. Computes aggregate statistics
(mean, median, sum, count, min, max, percentile, mode) grouped by a specified column,
then formats and writes the final report in CSV or JSON format.

The stats output now includes a `metadata` section with computation timestamp, total
row count, group count, and aggregation dimensions.

## Sub-Modules

| Directory            | Script          | Description                                              |
| -------------------- | --------------- | -------------------------------------------------------- |
| `stats-aggregator/`  | `aggregator.py` | Group-by aggregation with configurable metrics and percentiles |
| `format-writer/`     | `writer.py`     | Format and write final report file                       |

## Available Statistics

The stats-aggregator computes the following metrics per group:

- **mean**: Arithmetic mean of values
- **median**: Middle value (50th percentile)
- **sum**: Total of all values
- **count**: Number of records
- **min**: Minimum value
- **max**: Maximum value
- **percentile**: Configurable percentile values (e.g. 25th, 75th) via `--percentiles`
- **mode**: Most frequently occurring value

## Stats Report JSON Schema

The stats-aggregator produces a JSON file with this structure:

```json
{
  "group_column": "<column_name>",
  "metadata": {
    "timestamp": "<ISO 8601>",
    "total_rows": <int>,
    "group_count": <int>,
    "value_column": "<column_name>",
    "metrics_computed": ["<metric>", ...]
  },
  "groups": {
    "<group_value>": {
      "mean": <float>,
      "median": <float>,
      "sum": <float>,
      "count": <int>,
      "min": <float>,
      "max": <float>,
      "percentile_25": <float>,
      "percentile_75": <float>,
      "mode": <float>
    },
    ...
  }
}
```

The format-writer reads this schema (including the metadata section) and converts it
to the final output format.

## Inputs

- `--input` / `-i`: Path to JSON records file (required)
- `--group-by` / `-g`: Column name to group by (required)
- `--metrics`: Comma-separated list of metrics: `mean`, `median`, `sum`, `count`, `min`, `max`, `percentile`, `mode` (default: all standard six)
- `--percentiles`: Percentile values when using percentile metric, e.g. `10,25,50,75,90` (default: `25,75`)
- `--value-column` / `-v`: Column to aggregate (required)
- `--output-format` / `-f`: Output format: `csv` or `json` (default: `json`)
- `--output` / `-o`: Output directory (required)

## Output

- `stats_report.json`: Aggregated statistics with metadata (intermediate)
- `final_report.csv` or `final_report.json`: Formatted output report
