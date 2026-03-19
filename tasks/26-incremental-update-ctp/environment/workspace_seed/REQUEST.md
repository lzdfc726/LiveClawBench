# Request

Update the existing speculative-decoding note as a real delta, then write `output/result.json`.

Use exactly this JSON shape:

```json
{
  "task_id": "pkb_incremental_update_medium_001",
  "topic_id": "speculative_decoding",
  "preserved_claim_ids": [],
  "updated_claim_ids": [],
  "removed_claim_ids": [],
  "replacement_claims": {},
  "evidence_source_ids": [],
  "updated_artifacts": []
}
```

Allowed claim IDs:

- `exact_target_distribution_preserved`
- `draft_propose_target_verify`
- `separate_draft_model_always_required`
- `high_acceptance_alone_implies_speedup`
- `speculative_is_cache_only_shortcut`

Allowed replacement IDs:

- `separate_draft_not_always_required`
- `draft_cost_acceptance_and_system_fit`

Requirements:

- `preserved_claim_ids` must contain exactly:
  - `exact_target_distribution_preserved`
  - `draft_propose_target_verify`
- `updated_claim_ids` must contain exactly:
  - `separate_draft_model_always_required`
  - `high_acceptance_alone_implies_speedup`
- `removed_claim_ids` must contain exactly:
  - `speculative_is_cache_only_shortcut`
- `replacement_claims` must map:
  - `separate_draft_model_always_required` -> `separate_draft_not_always_required`
  - `high_acceptance_alone_implies_speedup` -> `draft_cost_acceptance_and_system_fit`
- `evidence_source_ids` must contain exactly:
  - `source_01_baseline`
  - `source_02_update`
  - `source_03_video`
  - `source_04_prior_note`
- `updated_artifacts` must list at least one non-empty markdown note you created or updated inside this workspace root.
