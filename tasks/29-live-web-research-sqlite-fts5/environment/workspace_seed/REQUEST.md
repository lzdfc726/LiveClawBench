# Request

Visit the pinned paper page and YouTube explainer, build a small local reference database, then write `output/result.json`.

You can initialize `db/spec_decode_live.db` with:

```bash
python3 tools/init_spec_decode_live_db.py db/spec_decode_live.db
python3 tools/open_pinned_sources.py
```

You can also create the same schema with Python's standard-library `sqlite3` module if you prefer. The database must end up with tables named `sources`, `facts`, and `qa_answers`.

Then write exactly this JSON shape to `output/result.json`:

```json
{
  "task_id": "pkb_live_web_research_hard_001",
  "topic_id": "speculative_decoding",
  "db_path": "db/spec_decode_live.db",
  "required_urls": {
    "paper": "https://proceedings.mlr.press/v202/leviathan23a.html",
    "video": "https://www.youtube.com/watch?v=i0EcdQT8Pvw"
  },
  "query_answers": {
    "paper_exactness": "",
    "paper_core_mechanism": "",
    "paper_venue": "",
    "video_role": ""
  },
  "updated_artifacts": []
}
```

Allowed answer IDs:

- `exact_target_preserving_acceleration`
- `draft_propose_target_verify`
- `pmlr_v202_icml_2023`
- `public_explainer_for_speculative_decoding`

Requirements:

- Open both pinned URLs with the real browser.
- You do not need to scrape the full pages. Open them, confirm the source roles, and use the exact answer IDs listed in the local follow-up note.
- `updated_artifacts` must list at least one non-empty markdown note you created or updated inside this workspace root.
