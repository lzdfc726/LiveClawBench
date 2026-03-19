---
name: report-generator-pipeline
description: End-to-end CSV data analysis and report generation pipeline — loads multi-format data, computes derived columns, filters, aggregates statistics, and exports formatted reports.
version: 1.0.0
---

# Report Generator Pipeline

## Skill Summary

A comprehensive data analysis pipeline that reads raw tabular data (CSV or JSON), transforms it
with derived column calculations, filters rows by conditions, computes aggregate statistics,
and writes formatted reports. The pipeline is organized into 3 stages with 6 sub-modules.

## Sub-Modules

| Directory                          | Script          | Stage           | Description                                           |
| ---------------------------------- | --------------- | --------------- | ----------------------------------------------------- |
| `data-loader/csv-parser/`          | `parser.py`     | Loading         | Parse CSV files with comma or tab delimiters          |
| `data-loader/json-parser/`         | `parser.py`     | Loading         | Parse JSON / JSON Lines files                         |
| `data-transformer/column-calculator/` | `calculator.py` | Transformation | Compute derived columns (sum, diff, ratio, multiply)  |
| `data-transformer/data-filter/`    | `filter.py`     | Transformation  | Filter rows by column conditions                      |
| `report-renderer/stats-aggregator/`| `aggregator.py` | Reporting       | Compute statistics: mean, median, sum, count, min, max|
| `report-renderer/format-writer/`   | `writer.py`     | Reporting       | Write final report as CSV or JSON                     |

## Pipeline Flow

```
Raw Files ──► Loading ──► Transformation ──► Reporting
  (CSV/       (2 modules)  (2 modules)       (2 modules)
   JSON)
```

## Inputs

- `--input` / `-i`: Path to input data file (CSV or JSON) (required)
- `--delimiter` / `-d`: CSV delimiter, supports comma (`,`) and tab (`\t`) (default: `,`)
- `--encoding` / `-e`: File encoding (default: `utf-8`)
- `--calc`: Calculation type for derived columns: `sum`, `diff`, `ratio`, `multiply` (default: `sum`)
- `--calc-columns`: Columns to use for calculation (comma-separated)
- `--filter-expr`: Row filter expression, e.g. `column>100`
- `--group-by` / `-g`: Column to group by for aggregation
- `--metrics`: Statistics to compute: `mean`, `median`, `sum`, `count`, `min`, `max` (comma-separated)
- `--output-format`: Output format: `csv` or `json` (default: `json`)
- `--output` / `-o`: Output directory (required)

## Output Files

- `parsed_data.json` — Parsed and normalized input records
- `transformed_data.json` — Data with derived columns and filters applied
- `stats_report.json` — Aggregated statistics per group, structured as:
  ```json
  {
    "group_column": "region",
    "groups": {
      "North": {"mean": 150.5, "median": 140, "sum": 3010, "count": 20, "min": 80, "max": 250},
      ...
    }
  }
  ```
- `final_report.csv` or `final_report.json` — Formatted output report

## Implementation

Each sub-module can be invoked independently:

```bash
# Step 1: Parse CSV input
python3 data-loader/csv-parser/parser.py -i sales.csv -d "," -o /tmp/stage1/

# Step 2: Compute derived columns (e.g. ratio of price to cost)
python3 data-transformer/column-calculator/calculator.py -i /tmp/stage1/parsed_data.json --calc ratio --columns price,cost -o /tmp/stage2/

# Step 3: Filter rows
python3 data-transformer/data-filter/filter.py -i /tmp/stage2/transformed_data.json --expr "revenue>100" -o /tmp/stage3/

# Step 4: Aggregate statistics
python3 report-renderer/stats-aggregator/aggregator.py -i /tmp/stage3/filtered_data.json -g region --metrics mean,median,sum -o /tmp/stage4/

# Step 5: Write final report
python3 report-renderer/format-writer/writer.py -i /tmp/stage4/stats_report.json -f json -o /tmp/final/
```

Dependencies: Python 3.8+ standard library only (`csv`, `json`, `statistics`, `argparse`, `os`)
