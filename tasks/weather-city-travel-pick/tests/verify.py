#!/usr/bin/env python3
import json
import os
import sys

OUTPUT_PATH = "/workspace/output/travel_pick.json"
LOG_DIR = "/logs/verifier"
os.makedirs(LOG_DIR, exist_ok=True)

# Seeded weather data (mirrors mock-platform/mocks/weather/src/seed.ts)
_SEED = {
    "上海":   {"aqi": 35,  "temp_high_c": 22},
    "深圳":   {"aqi": 28,  "temp_high_c": 30},
    "哈尔滨": {"aqi": 22,  "temp_high_c": 12},
    "北京":   {"aqi": 75,  "temp_high_c": 28},
    "成都":   {"aqi": 120, "temp_high_c": 23},
}
# Selection rule: "comfortable" = 15–26 °C; among qualifying cities pick lowest AQI.
# Shenzhen (30 °C) and Harbin (12 °C) fall outside the comfort band.
_TEMP_MIN, _TEMP_MAX = 15, 26
_BEST = min(
    (c for c, v in _SEED.items() if _TEMP_MIN <= v["temp_high_c"] <= _TEMP_MAX),
    key=lambda c: _SEED[c]["aqi"],
)
_BEST_AQI = _SEED[_BEST]["aqi"]
_BEST_TEMP = _SEED[_BEST]["temp_high_c"]


def write_reward(reward, dim_city, dim_aqi, dim_temp, city_got, aqi_got):
    with open(f"{LOG_DIR}/reward.txt", "w") as f:
        f.write(str(reward))
    with open(f"{LOG_DIR}/reward.json", "w") as f:
        json.dump(
            {
                "reward": reward,
                "dim_city": dim_city,
                "dim_aqi": dim_aqi,
                "dim_temp": dim_temp,
                "_meta_city_got": str(city_got),
                "_meta_aqi_got": int(aqi_got)
                if isinstance(aqi_got, (int, float))
                else -1,
            },
            f,
        )


try:
    with open(OUTPUT_PATH) as f:
        data = json.load(f)
except Exception:
    write_reward(0.0, 0, 0, 0, "", -1)
    print("Score: 0.0/1.0")
    sys.exit(1)

city = data.get("city", "")
aqi = data.get("aqi", None)
temp = data.get("temp_high_c", None)
reason = data.get("reason", "")

dim_city = 0.4 if city == _BEST else 0.0
dim_aqi = 0.3 if isinstance(aqi, int) and aqi == _BEST_AQI else 0.0
dim_temp = 0.3 if isinstance(temp, int) and abs(temp - _BEST_TEMP) <= 1 else 0.0

reward = dim_city + dim_aqi + dim_temp
write_reward(reward, dim_city, dim_aqi, dim_temp, city, aqi if aqi is not None else -1)
print(f"Score: {reward}/1.0")
# All three data fields and the required reason must be correct for a passing run.
if dim_city == 0.0 or dim_aqi == 0.0 or dim_temp == 0.0 or not isinstance(reason, str) or not reason.strip():
    sys.exit(1)
sys.exit(0 if reward >= 0.5 else 1)
