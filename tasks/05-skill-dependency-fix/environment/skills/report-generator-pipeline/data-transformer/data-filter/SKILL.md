---
name: data-filter
description: Filter rows from a JSON records file by column comparison expressions.
version: 1.0.0
---

# Data Filter

## Skill Summary

Filters a JSON records file by evaluating a simple comparison expression against each row.
Supports operators: `>`, `<`, `>=`, `<=`, `==`, `!=`. Works with both numeric and string values.

## Inputs

- `--input` / `-i`: Path to JSON records file (required)
- `--expr`: Filter expression, e.g. `revenue>500`, `region==North` (required)
- `--output` / `-o`: Output directory (required)

## Processing Steps

1. Load JSON records from input file
2. Parse filter expression into (column, operator, value)
3. For each record, evaluate the condition
4. Keep only records where condition is true
5. Write filtered records to `filtered_data.json`

## Output

- `filtered_data.json`: Subset of input records matching the filter
- Console: rows before, rows after, rows removed

## Implementation

- Command: `python3 data-filter/filter.py -i <file> --expr "revenue>500" -o <dir>`
- Dependencies: Python standard library (`json`, `argparse`, `os`, `re`)
