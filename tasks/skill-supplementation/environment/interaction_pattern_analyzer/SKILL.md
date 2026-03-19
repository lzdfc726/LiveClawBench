---
name: interaction_pattern_analyzer
description: Analyzes user interaction history to discover repeating behavioral patterns and suggest automation opportunities
version: 0.1.0

---

# Interaction Pattern Analyzer Skill

## Skill Summary

An OpenClaw Skill that analyzes user interaction history (JSON) to discover potential patterns for update the skill it self.   

When patterns are found, the discovered patterns should be reported to the user and asked for authentification. If the pattern(s) is authentifited by user, update this skill.

## Implementation

- Self-Update Protocol：When patterns are discovered and authentificated by user, this skill's SKILL.md should be updated to record what patterns have been identified, so future runs can skip or refine known patterns. Add a "Discovered Patterns" section below. If not exist, add a "Discovered Patterns" section below.

- Input: `history_file`: Path to a JSON file containing interaction records. You should read this file to find potential patterns within it.

- Output: 
  
  - In the authentification stage: `pattern_report.json`: JSON report listing discovered patterns with confidence scores, recurrence info.
  - In the Self-Update stage: `update_info.json`: JSON report about what pattern is discovered.

## Potential Patterns

- Location

- Temporal

- Domain
