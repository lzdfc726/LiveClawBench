#!/usr/bin/env bash
set -uo pipefail

# email-app backend (5001)
cd /workspace/environment/email-app/backend
python3 app.py > /tmp/email-backend.log 2>&1 &

# email-app frontend (5174)
cd /workspace/environment/email-app/frontend
npm run dev -- --host 0.0.0.0 > /tmp/email-frontend.log 2>&1 &

# calendar-app backend on port 3000 (single-process, no separate frontend)
cd /workspace/environment/calendar-app/backend
python3 app.py > /tmp/calendar-backend.log 2>&1 &

# Wait for services to come up
sleep 5
echo "All services started"
