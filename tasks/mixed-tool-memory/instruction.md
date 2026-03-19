Please complete the request in `REQUEST.md` using the local materials in `corpus/`. Start by listing `corpus/`, `workspace/`, and `tools/`, then read the markdown files you need instead of trying to read the directories themselves. For this task, the fastest path is usually `python3 tools/browser_mock_client.py home`, one or two searches from the request examples, and `python3 tools/init_spec_decode_db.py db/spec_decode_knowledge.db`. Some missing facts are only available through the local browser portal in `tools/`. Use `python3 tools/browser_mock_client.py ...` to search and open portal pages instead of fetching localhost URLs directly.


## Detailed Request

# Request

Build a small local reference database for speculative decoding, then write `output/result.json`.

Use the local browser client from `tools/` for portal access. Example commands:

```bash
python3 tools/browser_mock_client.py home
python3 tools/browser_mock_client.py search "self speculative decoding"
python3 tools/browser_mock_client.py visit "/docs/self-speculative-decoding-definition?sid=search_0001&rank=1"
python3 tools/init_spec_decode_db.py db/spec_decode_knowledge.db
```

You can create `db/spec_decode_knowledge.db` either with the helper above or with Python's standard-library `sqlite3` module. The database must end up with tables named `sources`, `facts`, and `qa_answers`.

Then write exactly this JSON shape to `output/result.json`:

```json
{
  "task_id": "pkb_hybrid_tool_memory_hard_001",
  "topic_id": "speculative_decoding",
  "db_path": "db/spec_decode_knowledge.db",
  "retrieved_evidence_ids": [],
  "query_answers": {
    "exactness_guarantee": "",
    "draft_requirement_status": "",
    "speedup_condition": "",
    "fallback_reason": "",
    "self_spec_definition": ""
  },
  "updated_artifacts": []
}
```

Allowed answer IDs:

- `exact_target_preserving_acceleration`
- `separate_draft_not_always_required`
- `draft_cost_acceptance_and_system_fit`
- `verification_overhead_or_low_acceptance`
- `same_model_or_partial_model_drafts_then_verifies`

Requirements:

- Use the local browser portal in `tools/` to gather the missing facts.
- Use the portal to confirm the missing facts and inspect at least one weak or noisy result, but use the exact answer IDs listed here when you write the final DB rows and `result.json`.
- `retrieved_evidence_ids` must contain exactly:
  - `browser:spec_exact_001`
  - `browser:self_spec_002`
  - `browser:spec_speed_003`
- The database must contain source rows for those evidence IDs and a row for the local video source `source_02_video`.
- `updated_artifacts` must list at least one non-empty markdown note you created or updated inside this workspace root.
