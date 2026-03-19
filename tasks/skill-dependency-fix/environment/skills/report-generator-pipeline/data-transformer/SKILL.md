---
name: data-transformer
description: Data transformation stage — computes derived columns and filters rows by conditions.
version: 1.0.0
---

# Data Transformer

## Skill Summary

The transformation stage of the report-generator-pipeline. Takes parsed records and applies
two types of operations: (1) computing new derived columns from existing ones, and
(2) filtering rows based on column conditions.

## Sub-Modules

| Directory             | Script           | Description                                        |
| --------------------- | ---------------- | -------------------------------------------------- |
| `column-calculator/`  | `calculator.py`  | Compute derived columns using arithmetic operations|
| `data-filter/`        | `filter.py`      | Filter rows by comparison expressions              |

## Available Calculation Types

The column-calculator supports the following arithmetic operations on pairs of columns:

- **sum**: `result = col_a + col_b`
- **diff**: `result = col_a - col_b`
- **ratio**: `result = col_a / col_b` (returns 0 if col_b is zero)
- **multiply**: `result = col_a * col_b`

These four operations cover standard derived-column needs for financial and numerical analysis.

## Inputs

- `--input` / `-i`: Path to parsed data JSON file (required)
- `--calc`: Calculation type: `sum`, `diff`, `ratio`, `multiply` (default: `sum`)
- `--columns`: Two column names for calculation (comma-separated)
- `--result-name`: Name for the computed column (default: `calculated`)
- `--filter-expr`: Filter expression, e.g. `revenue>500`
- `--output` / `-o`: Output directory (required)

## Output

- `transformed_data.json`: Records with new derived column added and/or rows filtered
