#!/usr/bin/env bash
set -uo pipefail
bash /workspace/startup.sh

curl -sS -X POST -H "Content-Type: application/json" \
  -d '{"vendor_name":"Northwind Components","amount":1840.50,"currency":"USD","invoice_date":"2026-04-03","attachment_ref":"inv_nc_2048"}' \
  http://localhost:5180/api/drafts
echo
echo "Oracle: expense draft created"
