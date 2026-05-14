#!/usr/bin/env bash
set -e

BASE="http://localhost:3000"
OUTPUT="/workspace/output/travel_pick.json"
mkdir -p /workspace/output

# Get list of all city slugs and display names
CITIES=$(curl -s "$BASE/api/locations")

BEST_SLUG=""
BEST_NAME=""
BEST_AQI=9999
BEST_TEMP=0

while IFS= read -r line; do
    SLUG=$(echo "$line" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d['slug'])")
    DISPLAY=$(echo "$line" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d['display_name'])")

    AQI_DATA=$(curl -s "$BASE/api/location/$SLUG/air-quality")
    AQI=$(echo "$AQI_DATA" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(int(d['aqi']))")

    TEMP_HTML=$(curl -s "$BASE/location/$SLUG")
    TEMP=$(echo "$TEMP_HTML" | python3 -c "
import sys, re
html = sys.stdin.read()
m = re.search(r'最高\s+(\d+)°C', html)
print(m.group(1) if m else '0')
")

    # Apply implicit comfort filter: good air quality (aqi < 100) and comfortable temperature (15..28°C)
    QUALIFIES=$(python3 -c "
aqi = int('$AQI')
temp = int('$TEMP')
print('yes' if aqi < 100 and 15 <= temp <= 28 else 'no')
")

    if [ "$QUALIFIES" = "yes" ] && [ "$AQI" -lt "$BEST_AQI" ]; then
        BEST_AQI=$AQI
        BEST_TEMP=$TEMP
        BEST_SLUG=$SLUG
        BEST_NAME=$DISPLAY
    fi
done < <(echo "$CITIES" | python3 -c "
import sys, json
cities = json.load(sys.stdin)
for c in cities:
    print(json.dumps(c))
")

REASON="$BEST_NAME 的空气质量指数 (AQI=$BEST_AQI) 在所有符合条件的城市中最低，且气温 ${BEST_TEMP}°C 适合出行。"

python3 -c "
import json
data = {
    'city': '$BEST_NAME',
    'aqi': int('$BEST_AQI'),
    'temp_high_c': int('$BEST_TEMP'),
    'reason': '$REASON'
}
with open('$OUTPUT', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
print('Written:', data)
"
