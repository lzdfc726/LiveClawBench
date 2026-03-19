---
name: csv-parser
description: Parse CSV files into structured records with configurable delimiter and encoding.
version: 1.0.0
---

# CSV Parser

## Skill Summary

Reads CSV files and converts them into a list of dictionaries (records). Supports comma and tab
delimiters, configurable file encoding (defaults to UTF-8), and automatic header detection from
the first row.

## Inputs

- `--input` / `-i`: Path to CSV file (required)
- `--delimiter` / `-d`: Column delimiter: `,` or `\t` (default: `,`)
- `--encoding` / `-e`: File encoding (default: `utf-8`)
- `--output` / `-o`: Output directory (required)

## Processing Steps

1. Open file with specified encoding
2. Read header row to determine column names
3. Parse each subsequent row into a dict keyed by column names
4. Attempt numeric conversion for values that look like numbers
5. Write records list to `parsed_data.json`

## Output

- `parsed_data.json`: JSON array of record objects
- Console summary: row count, column names, detected numeric columns

## Implementation

- Command: `python3 csv-parser/parser.py -i <file> -d "," -o <output_dir>`
- Dependencies: Python standard library (`csv`, `json`, `argparse`, `os`)
