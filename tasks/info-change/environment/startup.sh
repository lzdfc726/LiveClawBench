#!/usr/bin/env bash
set -euo pipefail

# Start shop-app
cd /workspace/environment/shop-app
bash start.sh > /tmp/shop.log 2>&1 &

sleep 3
echo 'All services started'

