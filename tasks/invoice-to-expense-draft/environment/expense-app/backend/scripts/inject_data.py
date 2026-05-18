#!/usr/bin/env python3
"""Expense app: starts empty -- agent must create one ExpenseDraft."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import ExpenseDraft, app


def main():
    with app.app_context():
        print(
            f"Expense app has {ExpenseDraft.query.count()} draft(s) at boot (expected 0)"
        )


if __name__ == "__main__":
    main()
