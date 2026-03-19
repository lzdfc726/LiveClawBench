# Skill Conflict Detection & Upgrade

Evaluate whether an agent can detect conflicts between actual interaction patterns and misleading content in an existing skill, communicate discrepancies to the user, and correctly upgrade the skill.

## Task Rounds

This task consists of 2 rounds of interaction:

**Round 1:** Analyze the interaction history in /workspace/environment/history.json and cross-check the results against the existing 'Discovered Patterns' in the interaction_pattern_analyzer skill. Are there any conflicts or inaccuracies?

**Round 2:** Please update the skill to correct any misleading content and add the real patterns you discovered. Save the updated skill files in /workspace/output.


## Evaluation Criteria

Maximum score: 50 points

- **SKILL_UPDATED** (10 pts): SKILL.md content differs from baseline (content was modified)
- **CONFLICT_IDENTIFIED** (10 pts): Model explicitly identifies conflicts/mismatches between existing skill patterns and actual history data
- **WEDNESDAY_PATTERN** (10 pts): Discovers the real Wednesday morning code-review pattern ('Wednesday' + 'code review'/'PR review')
- **FRIDAY_PATTERN** (10 pts): Discovers the real Friday afternoon weekly-digest pattern ('Friday' + 'digest'/'summary'/'周报')
- **MISLEADING_CORRECTED** (10 pts): Removes or explicitly corrects the false 'Monday Morning Paper Reading' pattern from the skill
