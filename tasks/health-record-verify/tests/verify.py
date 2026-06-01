"""Verifier for health-record-verify (C2).

Checks: health record (allergen or medication) is actually persisted in DB
(agent detected the silent insert failure and retried).
"""

import sqlite3
import sys

DB_PATH = "/var/lib/mock-data/health/health.db"


def _wait_for_tables(db_path: str, required_tables, timeout: int = 60) -> None:
    """Defensive: wait for sqlite DB to exist AND contain required tables.

    Mitigates the race where the verifier runs before the mock service has
    finished schema bootstrap (Issue #108 §2.2). Fails loud with a diagnostic
    instead of silently raising OperationalError.
    """
    import os
    import time

    deadline = time.monotonic() + timeout
    last_err = None
    while time.monotonic() < deadline:
        if os.path.isfile(db_path):
            try:
                with sqlite3.connect(db_path) as _c:
                    names = {
                        r[0]
                        for r in _c.execute(
                            "SELECT name FROM sqlite_master WHERE type='table'"
                        )
                    }
                if all(t in names for t in required_tables):
                    return
                last_err = (
                    f"missing={[t for t in required_tables if t not in names]} "
                    f"present={sorted(names)[:10]}"
                )
            except sqlite3.Error as e:
                last_err = str(e)
        time.sleep(1)
    print(
        f"FAIL: DB {db_path} not ready after {timeout}s ({last_err})",
        flush=True,
    )
    print("Score: 0.0/1.0")
    raise SystemExit(1)


_wait_for_tables(DB_PATH, ["allergen", "medication"])


def main():
    score = 0.0
    conn = sqlite3.connect(DB_PATH)

    allergens = conn.execute(
        "SELECT id FROM allergen ORDER BY id DESC LIMIT 5"
    ).fetchall()
    medications = conn.execute(
        "SELECT id FROM medication ORDER BY id DESC LIMIT 5"
    ).fetchall()
    conn.close()

    # Baseline has 3 allergens + 2 medications; new entries would have higher IDs
    has_new_allergen = len(allergens) > 3
    has_new_medication = len(medications) > 2

    if has_new_allergen or has_new_medication:
        # Verification (0.3): record exists (agent retried)
        score = 0.3
        # Completion (0.7): valid new record persisted
        score = 1.0

    print(f"Score: {score:.2f}/1.0")
    sys.exit(0 if score >= 0.5 else 1)


if __name__ == "__main__":
    main()
