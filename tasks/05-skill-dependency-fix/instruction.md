# Skill Hierarchy Change Propagation

Evaluate whether an agent can detect and propagate changes from bottom-level skills upward through a 3-level nested skill hierarchy. After 3 bottom-level skills are manually modified (csv-parser adds new delimiters, column-calculator removes 'ratio' and adds analytical functions, stats-aggregator adds percentile/mode and output metadata), the agent must update the 3 mid-level and 1 top-level SKILL.md files to maintain consistency — including parameter propagation, stale description correction, version bumping, and cross-module awareness.


## Agent Prompt

The bottom-level skills csv-parser, column-calculator, and stats-aggregator have been updated. Please review their changes and update all parent SKILL.md files (data-loader, data-transformer, report-renderer, and the top-level report-generator-pipeline) to reflect the new capabilities, removed features, and changed output schemas.


## Evaluation Criteria

Maximum score: 100 points

- **PARAM_PROPAGATED** (20 pts): New/deleted parameters from bottom-level skills (quote-char, comment-prefix, rank-method, percentiles) are propagated to mid-level and top-level SKILL.md files
- **STALE_REMOVED** (15 pts): Stale descriptions are corrected: 'comma and tab' → includes pipe/semicolon, 'ratio' formulas removed, 'six metrics' updated
- **NEW_CAPABILITY_DOC** (20 pts): New capabilities (pipe/semicolon delimiters, percentage/cumulative_sum/rank calcs, percentile/mode metrics) documented in upper-level files
- **OUTPUT_SCHEMA_UPDATED** (15 pts): Stats report output schema updated in report-renderer and top-level to include metadata section and new metric fields
- **VERSION_BUMPED** (10 pts): Version numbers updated in all 4 upper-level SKILL.md files (no longer 1.0.0)
- **CODE_EXAMPLE_FIXED** (10 pts): Top-level code examples updated: --calc ratio replaced, new features demonstrated
- **CROSS_CUTTING** (10 pts): Cross-module impact recognized: metadata in format-writer, ratio removal noted in data-transformer
