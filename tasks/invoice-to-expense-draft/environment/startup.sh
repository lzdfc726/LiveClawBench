#!/usr/bin/env bash
set -uo pipefail

# email-app backend (5001)
cd /workspace/environment/email-app/backend
python3 app.py > /tmp/email-backend.log 2>&1 &

# email-app frontend (5174)
cd /workspace/environment/email-app/frontend
npm run dev -- --host 0.0.0.0 > /tmp/email-frontend.log 2>&1 &

# expense-app backend (5180, single-process, serves HTML at /)
cd /workspace/environment/expense-app/backend
python3 app.py > /tmp/expense-backend.log 2>&1 &

sleep 5
echo "All services started"
