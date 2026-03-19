---
name: report-generator-pipeline
description: End-to-end CSV data analysis and report generation pipeline — loads multi-format data with flexible delimiters, computes derived and analytical columns, filters, aggregates statistics with percentiles, and exports formatted reports with metadata.
version: 1.1.0
---

# Report Generator Pipeline

## Skill Summary

A comprehensive data analysis pipeline that reads raw tabular data (CSV or JSON), transforms it
with derived column calculations and analytical functions, filters rows by conditions, computes
aggregate statistics (including percentile and mode), and writes formatted reports with metadata.
The pipeline is organized into 3 stages with 6 sub-modules.

## Sub-Modules

| Directory                             | Script          | Stage           | Description                                                      |
| ------------------------------------- | --------------- | --------------- | ---------------------------------------------------------------- |
| `data-loader/csv-parser/`             | `parser.py`     | Loading         | Parse CSV files with comma, tab, pipe, or semicolon delimiters   |
| `data-loader/json-parser/`            | `parser.py`     | Loading         | Parse JSON / JSON Lines files                                    |
| `data-transformer/column-calculator/` | `calculator.py` | Transformation  | Compute derived columns (sum, diff, multiply, percentage, cumulative_sum, rank) |
| `data-transformer/data-filter/`       | `filter.py`     | Transformation  | Filter rows by column conditions                                 |
| `report-renderer/stats-aggregator/`   | `aggregator.py` | Reporting       | Compute statistics: mean, median, sum, count, min, max, percentile, mode |
| `report-renderer/format-writer/`      | `writer.py`     | Reporting       | Write final report as CSV or JSON                                |

## Pipeline Flow

```
Raw Files ──► Loading ──► Transformation ──► Reporting
  (CSV/       (2 modules)  (2 modules)       (2 modules)
   JSON)
```

## Inputs

- `--input` / `-i`: Path to input data file (CSV or JSON) (required)
- `--delimiter` / `-d`: CSV delimiter: `,`, `\t`, `|`, or `;` (default: `,`)
- `--encoding` / `-e`: File encoding (default: `utf-8`)
- `--quote-char` / `-q`: Quote character for CSV fields (default: `"`)
- `--comment-prefix`: Skip CSV lines starting with this prefix (default: `#`)
- `--calc`: Calculation type for derived columns: `sum`, `diff`, `multiply`, `percentage`, `cumulative_sum`, `rank` (default: `sum`)
- `--calc-columns`: Columns to use for calculation (comma-separated; 2 for arithmetic, 1 for analytical)
- `--rank-method`: Ranking method for `rank` calc: `dense`, `min`, `max` (default: `dense`)
- `--filter-expr`: Row filter expression, e.g. `column>100`
- `--group-by` / `-g`: Column to group by for aggregation
- `--metrics`: Statistics to compute: `mean`, `median`, `sum`, `count`, `min`, `max`, `percentile`, `mode` (comma-separated)
- `--percentiles`: Percentile values when using percentile metric, e.g. `10,25,50,75,90` (default: `25,75`)
- `--output-format`: Output format: `csv` or `json` (default: `json`)
- `--output` / `-o`: Output directory (required)

## Output Files

- `parsed_data.json` — Parsed and normalized input records
- `transformed_data.json` — Data with derived columns and filters applied
- `stats_report.json` — Aggregated statistics per group with metadata, structured as:
  ```json
  {
    "group_column": "region",
    "metadata": {
      "timestamp": "2024-01-15T10:30:00",
      "total_rows": 100,
      "group_count": 4,
      "value_column": "revenue",
      "metrics_computed": ["mean", "median", "sum", "count"]
    },
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
# Step 1: Parse CSV input (supports pipe delimiter and comment skipping)
python3 data-loader/csv-parser/parser.py -i sales.csv -d "|" --comment-prefix "#" -o /tmp/stage1/

# Step 2: Compute derived columns (e.g. percentage of price in total)
python3 data-transformer/column-calculator/calculator.py -i /tmp/stage1/parsed_data.json --calc percentage --columns price,cost -o /tmp/stage2/

# Step 3: Filter rows
python3 data-transformer/data-filter/filter.py -i /tmp/stage2/transformed_data.json --expr "revenue>100" -o /tmp/stage3/

# Step 4: Aggregate statistics (with percentiles)
python3 report-renderer/stats-aggregator/aggregator.py -i /tmp/stage3/filtered_data.json -g region -v revenue --metrics mean,median,sum,percentile --percentiles 25,50,75 -o /tmp/stage4/

# Step 5: Write final report
python3 report-renderer/format-writer/writer.py -i /tmp/stage4/stats_report.json -f json -o /tmp/final/
```

Dependencies: Python 3.8+ standard library only (`csv`, `json`, `statistics`, `argparse`, `os`, `datetime`)
