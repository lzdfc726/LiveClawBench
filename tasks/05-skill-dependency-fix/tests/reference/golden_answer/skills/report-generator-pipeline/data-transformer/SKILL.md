---
name: data-transformer
description: Data transformation stage — computes derived and analytical columns (sum, diff, multiply, percentage, cumulative_sum, rank) and filters rows by conditions.
version: 1.1.0
---

# Data Transformer

## Skill Summary

The transformation stage of the report-generator-pipeline. Takes parsed records and applies
two types of operations: (1) computing new derived or analytical columns from existing ones,
and (2) filtering rows based on column conditions.

## Sub-Modules

| Directory             | Script           | Description                                              |
| --------------------- | ---------------- | -------------------------------------------------------- |
| `column-calculator/`  | `calculator.py`  | Compute derived columns using arithmetic and analytical operations |
| `data-filter/`        | `filter.py`      | Filter rows by comparison expressions                    |

## Available Calculation Types

The column-calculator supports the following operations:

**Arithmetic (two columns):**
- **sum**: `result = col_a + col_b`
- **diff**: `result = col_a - col_b`
- **multiply**: `result = col_a * col_b`
- **percentage**: `result = col_a / (col_a + col_b) * 100` (percentage of first in total)

**Analytical (one column):**
- **cumulative_sum**: Running sum of column values in row order
- **rank**: Rank values with configurable tie-breaking method (`dense`, `min`, `max`)

Note: The `ratio` calculation type was removed in v1.1.0. Use `percentage` for proportional
calculations or compute division in a pre-processing step.

## Inputs

- `--input` / `-i`: Path to parsed data JSON file (required)
- `--calc`: Calculation type: `sum`, `diff`, `multiply`, `percentage`, `cumulative_sum`, `rank` (default: `sum`)
- `--columns`: Column name(s) for calculation (comma-separated; 2 for arithmetic, 1 for analytical)
- `--result-name`: Name for the computed column (default: `calculated`)
- `--rank-method`: Ranking method for `rank`: `dense`, `min`, `max` (default: `dense`)
- `--filter-expr`: Filter expression, e.g. `revenue>500`
- `--output` / `-o`: Output directory (required)

## Output

- `transformed_data.json`: Records with new derived column added and/or rows filtered
