# Request

Repair the stale speculative-decoding note, then write `output/result.json`.

Use exactly this JSON shape:

```json
{
  "task_id": "pkb_conflict_repair_medium_001",
  "topic_id": "speculative_decoding",
  "incorrect_old_claim_ids": [],
  "corrected_claim_ids": [],
  "required_evidence_ids": [],
  "updated_artifacts": []
}
```

Allowed incorrect old claim IDs:

- `speculative_is_cache_only`
- `high_acceptance_implies_general_speedup`
- `separate_draft_model_always_required`

Allowed corrected claim IDs:

- `exact_target_preserving_acceleration`
- `draft_cost_acceptance_and_system_fit`
- `separate_draft_not_always_required`

Requirements:

- Use the local browser portal in `tools/` to gather the missing repair evidence.
- `incorrect_old_claim_ids` must contain all three incorrect IDs.
- `corrected_claim_ids` must contain all three corrected IDs.
- `required_evidence_ids` must contain exactly:
  - `browser:spec_exact_001`
  - `browser:spec_perf_002`
  - `browser:self_spec_003`
- `updated_artifacts` must list at least one non-empty markdown note you created or updated inside this workspace root.
