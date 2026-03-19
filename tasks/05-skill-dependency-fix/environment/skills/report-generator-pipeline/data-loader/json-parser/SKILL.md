---
name: json-parser
description: Parse JSON and JSON Lines files into structured records.
version: 1.0.0
---

# JSON Parser

## Skill Summary

Reads JSON files (standard JSON arrays or JSON Lines format) and converts them into a
normalized list of record dictionaries. Auto-detects format based on file content.

## Inputs

- `--input` / `-i`: Path to JSON or JSONL file (required)
- `--output` / `-o`: Output directory (required)

## Processing Steps

1. Read file content
2. Try parsing as JSON array first
3. If that fails, try parsing line-by-line as JSON Lines
4. Normalize all records to flat dicts (one level)
5. Write records list to `parsed_data.json`

## Output

- `parsed_data.json`: JSON array of record objects
- Console summary: row count, detected format (JSON/JSONL), column names

## Implementation

- Command: `python3 json-parser/parser.py -i <file> -o <output_dir>`
- Dependencies: Python standard library (`json`, `argparse`, `os`)
