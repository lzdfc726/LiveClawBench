#!/usr/bin/env python3
import json
import os
import sys

OUTPUT_PATH = "/workspace/output/travel_pick.json"
LOG_DIR = "/logs/verifier"
os.makedirs(LOG_DIR, exist_ok=True)


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

dim_city = 0.4 if city == "上海" else 0.0
dim_aqi = 0.3 if isinstance(aqi, int) and aqi == 35 else 0.0
dim_temp = 0.3 if isinstance(temp, int) and abs(temp - 22) <= 1 else 0.0

reward = dim_city + dim_aqi + dim_temp
write_reward(reward, dim_city, dim_aqi, dim_temp, city, aqi if aqi is not None else -1)
print(f"Score: {reward}/1.0")
sys.exit(0 if reward >= 0.5 else 1)
