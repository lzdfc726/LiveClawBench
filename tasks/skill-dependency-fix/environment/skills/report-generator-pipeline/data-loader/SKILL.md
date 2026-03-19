---
name: data-loader
description: Data loading stage — parses CSV and JSON files into normalized records with configurable delimiters and encoding detection.
version: 1.0.0
---

# Data Loader

## Skill Summary

The loading stage of the report-generator-pipeline. Handles reading raw data files (CSV or JSON)
and converting them into a unified list-of-dicts format for downstream processing.

CSV parsing supports comma (`,`) and tab (`\t`) delimiters with configurable encoding.
JSON parsing handles both standard JSON arrays and JSON Lines format.

## Sub-Modules

| Directory      | Script      | Description                                          |
| -------------- | ----------- | ---------------------------------------------------- |
| `csv-parser/`  | `parser.py` | Parse CSV with comma/tab delimiters and encoding     |
| `json-parser/` | `parser.py` | Parse JSON arrays and JSON Lines files               |

## Inputs

- `--input` / `-i`: Path to data file (required)
- `--delimiter` / `-d`: CSV delimiter: `,` or `\t` (default: `,`; ignored for JSON)
- `--encoding` / `-e`: File encoding (default: `utf-8`)
- `--output` / `-o`: Output directory for parsed result

## Output

- `parsed_data.json`: List of record dicts in JSON format
- Console: row count, column names detected

## Supported Delimiters

The CSV parser supports two delimiter types:
- **Comma** (`,`): Standard CSV format
- **Tab** (`\t`): Tab-separated values (TSV)

Other delimiters are not currently supported. If you need pipe-delimited or semicolon-delimited
files, pre-convert them to CSV before loading.
