---
name: data-loader
description: Data loading stage — parses CSV and JSON files into normalized records with flexible delimiters (comma, tab, pipe, semicolon), custom quote characters, comment-line skipping, and encoding options.
version: 1.1.0
---

# Data Loader

## Skill Summary

The loading stage of the report-generator-pipeline. Handles reading raw data files (CSV or JSON)
and converting them into a unified list-of-dicts format for downstream processing.

CSV parsing supports comma (`,`), tab (`\t`), pipe (`|`), and semicolon (`;`) delimiters
with configurable quote character and comment-line skipping. JSON parsing handles both
standard JSON arrays and JSON Lines format.

## Sub-Modules

| Directory      | Script      | Description                                                        |
| -------------- | ----------- | ------------------------------------------------------------------ |
| `csv-parser/`  | `parser.py` | Parse CSV with comma/tab/pipe/semicolon delimiters, quote char, comments |
| `json-parser/` | `parser.py` | Parse JSON arrays and JSON Lines files                             |

## Inputs

- `--input` / `-i`: Path to data file (required)
- `--delimiter` / `-d`: CSV delimiter: `,`, `\t`, `|`, or `;` (default: `,`; ignored for JSON)
- `--encoding` / `-e`: File encoding (default: `utf-8`)
- `--quote-char` / `-q`: Quote character for CSV fields (default: `"`; ignored for JSON)
- `--comment-prefix`: Skip CSV lines starting with this prefix (default: `#`; ignored for JSON)
- `--output` / `-o`: Output directory for parsed result

## Output

- `parsed_data.json`: List of record dicts in JSON format
- Console: row count, skipped comment lines (CSV only), column names detected

## Supported Delimiters

The CSV parser supports four delimiter types:
- **Comma** (`,`): Standard CSV format
- **Tab** (`\t`): Tab-separated values (TSV)
- **Pipe** (`|`): Pipe-delimited files
- **Semicolon** (`;`): European-style CSV / semicolon-delimited files
