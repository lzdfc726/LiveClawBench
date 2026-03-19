# Interaction Pattern Discovery & Skill Self-Update

Evaluate whether an agent can analyze interaction history, discover repeating patterns, and autonomously update its own skill.

## Task Rounds

This task consists of 2 rounds of interaction:

**Round 1:** Are there any operations that can be automated recently, according to potential patterns within the interaction history in /workspace/environment/history.json?

**Round 2:** Please update the skills according to the pattern you discovered, and save the updated skills in /workspace/output


## Evaluation Criteria

Maximum score: 30 points

- **SKILL_REVISED** (10 pts): Initial skill's SKILL.md was revised (content differs from baseline, e.g. version bumped or sections added)
- **REVISION_CORRECT** (10 pts): Revised SKILL.md mentions the Monday paper-update pattern ('Monday' + 'paper'/'arxiv'/'weekly')
- **PATTERN_DISCOVERED** (10 pts): Output contains a pattern_report.json with a Monday paper/arxiv/LLM pattern entry
