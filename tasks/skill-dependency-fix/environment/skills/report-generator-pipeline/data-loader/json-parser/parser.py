#!/usr/bin/env python3
"""JSON Parser — reads JSON or JSON Lines files and outputs JSON records."""

import argparse
import json
import os


def parse_json(input_path: str) -> list:
    """Parse a JSON or JSONL file into a list of dicts."""
    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read().strip()

    # Try standard JSON array first
    try:
        data = json.loads(content)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
    except json.JSONDecodeError:
        pass

    # Try JSON Lines
    records = []
    for line in content.split("\n"):
        line = line.strip()
        if line:
            records.append(json.loads(line))
    return records


def main():
    parser = argparse.ArgumentParser(description="Parse JSON/JSONL files into records")
    parser.add_argument("-i", "--input", required=True, help="Input JSON file path")
    parser.add_argument("-o", "--output", required=True, help="Output directory")
    args = parser.parse_args()

    records = parse_json(args.input)

    os.makedirs(args.output, exist_ok=True)
    out_path = os.path.join(args.output, "parsed_data.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    fmt = "JSON" if records else "empty"
    columns = list(records[0].keys()) if records else []
    print(f"Parsed {len(records)} rows ({fmt}), columns: {columns}")
    print(f"Output: {out_path}")


if __name__ == "__main__":
    main()
