#!/usr/bin/env bash
set -e
mkdir -p /workspace/output

python3 - <<'PYEOF'
import json
import re
import urllib.request

BASE = "http://localhost:3000"

# Canonical Chinese city names keyed by URL slug.
# Avoids relying on display_name from the API, which may be mis-decoded.
SLUG_CITY = {
    "shanghai": "上海",
    "beijing":  "北京",
    "shenzhen": "深圳",
    "chengdu":  "成都",
    "harbin":   "哈尔滨",
}


def fetch_json(url):
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_html(url):
    with urllib.request.urlopen(url) as r:
        return r.read().decode("utf-8", errors="replace")


resp = fetch_json(f"{BASE}/api/locations")
cities = resp["data"]

best = None
best_aqi = 9999

for city in cities:
    slug = city["slug"]
    display = SLUG_CITY.get(slug)
    if display is None:
        continue

    aq = fetch_json(f"{BASE}/api/location/{slug}/air-quality")
    aqi = int(aq["data"]["aqi"])

    html = fetch_html(f"{BASE}/location/{slug}")
    # High temp appears in <div style="font-size:48px;font-weight:200">22°C</div>.
    # Match only the ASCII digits to avoid encoding-sensitive °C / Chinese text.
    m = re.search(r"font-size:48px[^>]*>(\d+)", html)
    temp = int(m.group(1)) if m else 0

    if 15 <= temp <= 26 and aqi <= 50 and aqi < best_aqi:
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
