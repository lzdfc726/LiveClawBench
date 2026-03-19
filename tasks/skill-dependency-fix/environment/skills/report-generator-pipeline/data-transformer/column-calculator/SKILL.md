---
name: column-calculator
description: Compute derived columns from existing data using arithmetic operations (sum, diff, ratio, multiply).
version: 1.0.0
---

# Column Calculator

## Skill Summary

Takes a JSON records file and computes a new derived column by applying an arithmetic operation
to two existing columns. Supports four operation types: sum, diff, ratio, and multiply.

## Inputs

- `--input` / `-i`: Path to JSON records file (required)
- `--calc`: Calculation type: `sum`, `diff`, `ratio`, `multiply` (required)
- `--columns`: Two source column names, comma-separated (required)
- `--result-name`: Name for the new column (default: `calculated`)
- `--output` / `-o`: Output directory (required)

## Calculation Types

| Type       | Formula              | Notes                        |
| ---------- | -------------------- | ---------------------------- |
| `sum`      | `col_a + col_b`      | Numeric addition             |
| `diff`     | `col_a - col_b`      | Numeric subtraction          |
| `ratio`    | `col_a / col_b`      | Division; returns 0 if b==0  |
| `multiply` | `col_a * col_b`      | Numeric multiplication       |

## Processing Steps

1. Load JSON records from input file
2. For each record, extract the two source column values as floats
3. Apply the selected arithmetic operation
4. Add the result as a new column to each record
5. Write updated records to `transformed_data.json`

## Output

- `transformed_data.json`: Input records with new derived column appended

## Implementation

- Command: `python3 column-calculator/calculator.py -i <file> --calc ratio --columns price,cost -o <dir>`
- Dependencies: Python standard library (`json`, `argparse`, `os`)
