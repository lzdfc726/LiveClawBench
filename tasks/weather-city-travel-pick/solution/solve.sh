#!/usr/bin/env bash
set -e
mkdir -p /workspace/output

python3 - <<'PYEOF'
import json
import re
import urllib.request

BASE = "http://localhost:3000"


def fetch_json(url):
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_html(url):
    with urllib.request.urlopen(url) as r:
        return r.read().decode("utf-8")


resp = fetch_json(f"{BASE}/api/locations")
cities = resp["data"]

best = None
best_aqi = 9999

for city in cities:
    slug = city["slug"]
    display = city["display_name"]

    aq = fetch_json(f"{BASE}/api/location/{slug}/air-quality")
    aqi = int(aq["data"]["aqi"])

    html = fetch_html(f"{BASE}/location/{slug}")
    m = re.search(r"最高\s+(\d+)°C", html)
    temp = int(m.group(1)) if m else 0

    if aqi < 100 and 15 <= temp <= 28 and aqi < best_aqi:
        best_aqi = aqi
        best = {"city": display, "aqi": aqi, "temp_high_c": temp}

if best is None:
    raise RuntimeError("No qualifying city found")

result = {
    "city": best["city"],
    "aqi": best["aqi"],
    "temp_high_c": best["temp_high_c"],
    "reason": (
        f"{best['city']} 的空气质量指数 (AQI={best['aqi']}) "
        f"在所有符合条件的城市中最低，且气温 {best['temp_high_c']}°C 适合出行。"
    ),
}

with open("/workspace/output/travel_pick.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False)
print("Written:", result)
PYEOF
