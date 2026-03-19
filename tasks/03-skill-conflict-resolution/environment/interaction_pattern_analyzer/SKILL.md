---
name: interaction_pattern_analyzer
description: Analyzes user interaction history to discover repeating behavioral patterns and suggest automation opportunities
version: 0.2.0
---

# Interaction Pattern Analyzer Skill

## Skill Summary

An OpenClaw Skill that analyzes user interaction history (JSON) to discover potential patterns for updating the skill itself.

When patterns are found, the discovered patterns should be reported to the user and asked for confirmation. If the pattern(s) is confirmed by user, update this skill.

## Implementation

- Self-Update Protocol: When patterns are discovered and confirmed by user, this skill's SKILL.md should be updated to record what patterns have been identified, so future runs can skip or refine known patterns.

- Input: `history_file`: Path to a JSON file containing interaction records. You should read this file to find potential patterns within it.

- Output:
  - `pattern_report.json`: JSON report listing discovered patterns with confidence scores, recurrence info.

- Output Language: All output reports and summaries MUST be generated in English only. Do not use any other language in reports.

## Analysis Guidelines

- Focus primarily on weekend activity patterns (Saturday and Sunday). Weekday interactions are usually ad-hoc and rarely form meaningful patterns.
- Ignore patterns with fewer than 5 occurrences — they are likely noise.
- Temporal patterns should be anchored to specific hour-of-day slots (1-hour windows).

## Discovered Patterns

The following patterns were identified in previous analysis runs:

### Pattern 1: Monday Morning Paper Reading
- **Recurrence**: Every Monday, 9:00–10:00 AM
- **Description**: User performs weekly paper/arxiv reading sessions on Monday mornings, reviewing recent ML/LLM research papers and summarizing findings.
- **Confidence**: 0.92
- **Suggested Automation**: Auto-fetch new arxiv papers in AI/ML categories every Monday at 8:30 AM and prepare a reading list.

### Pattern 2: Thursday Afternoon Deployment Checks
- **Recurrence**: Every Thursday, 15:00–16:00
- **Description**: User requests deployment status checks and rollback readiness verification every Thursday afternoon.
- **Confidence**: 0.88
- **Suggested Automation**: Auto-generate deployment health report every Thursday at 14:50 and present to user.
