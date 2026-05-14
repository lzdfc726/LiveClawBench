#!/usr/bin/env python3
import json
import os
import sys

OUTPUT_PATH = "/workspace/output/exercise_window.json"
LOG_DIR = "/logs/verifier"
os.makedirs(LOG_DIR, exist_ok=True)

EXPECTED_START = 0
EXPECTED_END = 9
EXPECTED_DURATION = 10


def write_reward(
    reward, dim_start, dim_end, dim_duration, start_got, end_got, duration_got
):
    with open(f"{LOG_DIR}/reward.txt", "w") as f:
        f.write(str(reward))
    with open(f"{LOG_DIR}/reward.json", "w") as f:
        json.dump(
            {
                "reward": reward,
                "dim_start": dim_start,
                "dim_end": dim_end,
                "dim_duration": dim_duration,
                "start_got": start_got,
                "end_got": end_got,
                "duration_got": duration_got,
            },
            f,
        )


try:
    with open(OUTPUT_PATH) as f:
        data = json.load(f)
except Exception:
    write_reward(0.0, 0, 0, 0, -1, -1, -1)
    print("Score: 0.0/1.0")
    sys.exit(1)

start_hour = data.get("start_hour", None)
end_hour = data.get("end_hour", None)
duration_hours = data.get("duration_hours", None)

dim_start = 0.4 if type(start_hour) is int and start_hour == EXPECTED_START else 0.0
dim_end = 0.4 if type(end_hour) is int and end_hour == EXPECTED_END else 0.0
dim_duration = (
    0.2 if type(duration_hours) is int and duration_hours == EXPECTED_DURATION else 0.0
)

reward = dim_start + dim_end + dim_duration
write_reward(
    reward,
    dim_start,
    dim_end,
    dim_duration,
    start_hour if type(start_hour) is int else -1,
    end_hour if type(end_hour) is int else -1,
    duration_hours if type(duration_hours) is int else -1,
)
print(f"Score: {reward}/1.0")
sys.exit(0 if reward >= 0.5 else 1)
