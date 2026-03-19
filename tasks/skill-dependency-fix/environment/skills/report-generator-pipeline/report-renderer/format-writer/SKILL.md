---
name: format-writer
description: Format and write final report from stats aggregation results in CSV or JSON format.
version: 1.0.0
---

# Format Writer

## Skill Summary

Takes a stats aggregation JSON file (produced by stats-aggregator) and converts it into the
final output format. Supports CSV and JSON output. The input must follow the stats-aggregator
output schema: a `group_column` field and a `groups` dict mapping group names to metric dicts
containing mean, median, sum, count, min, and max values.

## Expected Input Schema

The input JSON must match this structure:

```json
{
  "group_column": "<name>",
  "groups": {
    "<group>": {"mean": ..., "median": ..., "sum": ..., "count": ..., "min": ..., "max": ...},
    ...
  }
}
```

No other fields are expected. The writer iterates over each group and outputs one row per group
with all available metrics as columns.

## Inputs

- `--input` / `-i`: Path to stats_report.json (required)
- `--format` / `-f`: Output format: `csv` or `json` (default: `json`)
- `--output` / `-o`: Output directory (required)

## Processing Steps

1. Load stats_report.json
2. Extract group_column and groups data
3. For CSV: write header row (group + metric names), then one row per group
4. For JSON: reformat into a list of flat objects with group name + metrics
5. Write to `final_report.csv` or `final_report.json`

## Output

- `final_report.csv` or `final_report.json`
- Console: number of groups written, output file path

## Implementation

- Command: `python3 format-writer/writer.py -i stats_report.json -f json -o <dir>`
- Dependencies: Python standard library (`json`, `csv`, `argparse`, `os`)
