# Repetitive Task Recognition & Skill Creation

Evaluate whether an agent can recognize repetitive CSV-cleaning tasks across multiple rounds, proactively propose creating a reusable skill, and produce a valid SKILL.md.

## Task Rounds

This task consists of 6 rounds of interaction:

**Round 1:** Please clean up /workspace/environment/data/sales_jan.csv for me. Remove all empty rows, standardize the date column to YYYY-MM-DD format, remove duplicate rows (by order_id), sort by amount in descending order, and save the result to /workspace/environment/cleaned/sales_jan_cleaned.csv.

**Round 2:** Now do the same thing for /workspace/environment/data/sales_feb.csv. Output to /workspace/environment/cleaned/sales_feb_cleaned.csv.

**Round 3:** Same for /workspace/environment/data/sales_mar.csv please. Output to /workspace/environment/cleaned/sales_mar_cleaned.csv.

**Round 4:** And /workspace/environment/data/sales_apr.csv too, same thing. Output to /workspace/environment/cleaned/sales_apr_cleaned.csv.

**Round 5:** ok. also for /workspace/environment/data/sales_jun.csv for me. also save the result to /workspace/environment/cleaned

**Round 6:** for /workspace/environment/data/sales_may.csv, sales_jul.csv sales_aug.csv, do the same operation.


**Skill Creation Trigger:** /skill skill-creator create a skill for me. store in /workspace/model_responses


## Evaluation Criteria

Maximum score: 100 points

- **SKILL_CREATED_AUTO** (100 pts): Agent autonomously identified the repetitive pattern and created SKILL.md without explicit instruction
- **SKILL_CREATED_PROMPTED** (50 pts): Agent created SKILL.md only after receiving an explicit /skill command
- **SKILL_NOT_CREATED** (0 pts): Agent failed to create SKILL.md even after explicit instruction
