#!/usr/bin/env bash
set -euo pipefail

cd /workspace

# Multi-round dialogue execution
# Round 1
openclaw agent -m "Please clean up /workspace/environment/data/sales_jan.csv for me. Remove all empty rows, standardize the date column to YYYY-MM-DD format, remove duplicate rows (by order_id), sort by amount in descending order, and save the result to /workspace/environment/cleaned/sales_jan_cleaned.csv."

# Round 2
openclaw agent -m "Now do the same thing for /workspace/environment/data/sales_feb.csv. Output to /workspace/environment/cleaned/sales_feb_cleaned.csv."

# Round 3
openclaw agent -m "Same for /workspace/environment/data/sales_mar.csv please. Output to /workspace/environment/cleaned/sales_mar_cleaned.csv."

# Round 4
openclaw agent -m "And /workspace/environment/data/sales_apr.csv too, same thing. Output to /workspace/environment/cleaned/sales_apr_cleaned.csv."

# Round 5
openclaw agent -m "ok. also for /workspace/environment/data/sales_jun.csv for me. also save the result to /workspace/environment/cleaned"

# Round 6
openclaw agent -m "for /workspace/environment/data/sales_may.csv, sales_jul.csv sales_aug.csv, do the same operation."

