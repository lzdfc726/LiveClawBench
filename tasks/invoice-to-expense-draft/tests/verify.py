#!/usr/bin/env python3
"""Verify invoice-to-expense-draft.

Reward (sum = 1.0):
  0.8 best ExpenseDraft row matching the target fields:
      vendor_name == 'Northwind Components'   (+0.16)
      abs(amount - 1840.50) <= 0.005          (+0.16)
      currency == 'USD'                       (+0.16)
      invoice_date == '2026-04-03'            (+0.16)
      attachment_ref == 'inv_nc_2048'         (+0.16)
  0.2 distractor: no draft references the purchase-ack distractor
      (vendor matching 'northbound', or amount ~ 920.00)
"""
import importlib.util
import json
import os
import sys

EXPENSE_APP_PATH = "/workspace/environment/expense-app/backend/app.py"

spec = importlib.util.spec_from_file_location("expense_module", EXPENSE_APP_PATH)
expense_module = importlib.util.module_from_spec(spec)
sys.path.insert(0, os.path.dirname(EXPENSE_APP_PATH))
spec.loader.exec_module(expense_module)


def check():
    with expense_module.app.app_context():
        drafts = expense_module.ExpenseDraft.query.all()
        per_field = 0.16
        best_field_score = 0.0
        for d in drafts:
            s = 0.0
            if (d.vendor_name or "").strip() == "Northwind Components":
                s += per_field
            if d.amount is not None and abs(d.amount - 1840.50) <= 0.005:
                s += per_field
            if (d.currency or "").upper() == "USD":
                s += per_field
            if (d.invoice_date or "") == "2026-04-03":
                s += per_field
            if (d.attachment_ref or "") == "inv_nc_2048":
                s += per_field
            if s > best_field_score:
                best_field_score = s
        field_score = round(min(best_field_score, 0.8), 3)

        distractor_hit = False
        for d in drafts:
            v = (d.vendor_name or "").lower()
            if "northbound" in v or "northpeak" in v:
                distractor_hit = True
                break
            if d.amount is not None and 919.5 <= d.amount <= 920.5:
                distractor_hit = True
                break
        distractor_score = 0.0 if distractor_hit else 0.2

        reward = round(field_score + distractor_score, 3)
        print(f"drafts={len(drafts)}  field_score={field_score}  distractor_score={distractor_score}")
        os.makedirs("/logs/verifier", exist_ok=True)
        with open("/logs/verifier/reward.json", "w") as f:
            json.dump({"reward": reward, "field_score": field_score, "distractor_score": distractor_score}, f)
        return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
