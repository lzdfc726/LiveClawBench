#!/usr/bin/env python3
"""
OpenClaw Benchmark Case 1 — Evaluation Script
================================================
Checks whether SKILL.md exists (recursively) under MODEL_RESPONSE_DIR.

Usage:
  python evaluate.py <MODEL_RESPONSE_DIR> [--output-json score.json]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List


def find_skill_md(root: Path) -> List[Path]:
    """Recursively search for SKILL.md under root."""
    if not root.exists():
        return []
    return list(root.rglob("SKILL.md"))


def evaluate(model_response_dir: Path) -> Dict[str, Any]:
    """Run evaluation and return a score report."""
    found = find_skill_md(model_response_dir)
    passed = len(found) > 0

    return {
        "case": "sh_case1",
        "task": "SKILL_CREATION",
        "passed": passed,
        "detail": str(found[0]) if passed else "No SKILL.md found",
    }


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate OpenClaw Benchmark Case 1 — SKILL_CREATION"
    )
    parser.add_argument(
        "model_response_dir",
        type=Path,
        help="Directory to recursively search for SKILL.md",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=None,
        help="Write JSON score report to this file",
    )
    args = parser.parse_args()

    if not args.model_response_dir.is_dir():
        print(f"Directory not found: {args.model_response_dir}", file=sys.stderr)
        sys.exit(2)

    report = evaluate(args.model_response_dir.resolve())

    # Print human-readable summary
    status = "PASS" if report["passed"] else "FAIL"
    print("=" * 60)
    print("  OpenClaw Benchmark Case 1 — Evaluation Results")
    print("=" * 60)
    print(f"  [{status}] SKILL_CREATION")
    print(f"         {report['detail']}")
    print("=" * 60)

    if args.output_json:
        args.output_json.parent.mkdir(parents=True, exist_ok=True)
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"\nScore report written to: {args.output_json}")

    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
