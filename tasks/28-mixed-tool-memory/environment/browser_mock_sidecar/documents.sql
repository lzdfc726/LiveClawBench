BEGIN;

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO metadata (key, value) VALUES
  ('site_title', 'Speculative Decoding Browser Portal'),
  ('home_title', 'Speculative Decoding Reference Portal'),
  ('home_description', 'Search validated follow-up notes, benchmark writeups, and noisy leftovers about speculative decoding.'),
  ('search_placeholder', 'Search for exactness, self speculative decoding, speedup condition');

CREATE TABLE query_examples (
  position INTEGER PRIMARY KEY,
  query TEXT NOT NULL
);

INSERT INTO query_examples (position, query) VALUES
  (1, 'exact target verification'),
  (2, 'self speculative decoding'),
  (3, 'speedup condition acceptance system fit'),
  (4, 'acceptance alone speedup');

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  reliability TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  owner TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT NOT NULL
);

CREATE VIRTUAL TABLE documents_fts USING fts5(
  title,
  summary,
  body,
  tags,
  content='documents',
  content_rowid='rowid',
  tokenize='porter unicode61'
);

CREATE TRIGGER documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_fts(rowid, title, summary, body, tags)
  VALUES (new.rowid, new.title, new.summary, new.body, new.tags);
END;

INSERT INTO documents (id, slug, title, kind, status, reliability, updated_at, owner, summary, body, tags) VALUES (
  'browser:spec_exact_001',
  'speculative-decoding-exactness-note',
  'Exactness Comes From Target Verification',
  'research_note',
  'validated',
  'high',
  '2026-02-06',
  'inference-research',
  'Speculative decoding stays exact because the target model verifies the drafted tokens before commitment.',
  'The durable exactness statement is target-distribution-preserving acceleration through draft proposal plus target verification.\n\nThis is not beam search and not cache-only reuse.',
  'speculative decoding | exact | verification'
);

INSERT INTO documents (id, slug, title, kind, status, reliability, updated_at, owner, summary, body, tags) VALUES (
  'browser:self_spec_002',
  'self-speculative-decoding-definition',
  'Self-Speculative Decoding Definition',
  'update_note',
  'validated',
  'high',
  '2026-02-15',
  'inference-research',
  'Later work shows that a separate draft model is not always required.',
  'Self-speculative decoding reuses part of the same model or a partial pass as the drafter while the target verification step remains in place.\n\nThat means the old separate-draft-always-required claim should be retired.',
  'speculative decoding | self speculative | draft model'
);

INSERT INTO documents (id, slug, title, kind, status, reliability, updated_at, owner, summary, body, tags) VALUES (
  'browser:spec_speed_003',
  'speculative-decoding-speedup-rule',
  'Speedup Rule for Deployment',
  'benchmark_note',
  'validated',
  'high',
  '2026-02-18',
  'serving-benchmarks',
  'The practical speedup depends on draft cost, acceptance, and system fit together.',
  'High acceptance helps, but it is not enough by itself.\n\nIf draft cost is too high or verification overhead dominates, the latency gain can disappear.\n\nThe fallback explanation for disappointing results is verification overhead or low acceptance.',
  'speculative decoding | speedup | acceptance | system fit | overhead'
);

INSERT INTO documents (id, slug, title, kind, status, reliability, updated_at, owner, summary, body, tags) VALUES (
  'browser:spec_noise_001',
  'acceptance-alone-shortcut',
  'Acceptance Alone Shortcut',
  'legacy_note',
  'superseded',
  'low',
  '2025-10-01',
  'legacy-serving',
  'Treat high acceptance as sufficient evidence that deployment will be faster.',
  'This shortcut ignores draft cost and system fit, and later benchmark notes marked it unreliable.',
  'speculative decoding | acceptance | shortcut'
);

INSERT INTO documents (id, slug, title, kind, status, reliability, updated_at, owner, summary, body, tags) VALUES (
  'browser:spec_noise_002',
  'target-model-no-longer-matters',
  'Target Model No Longer Matters',
  'marketing_post',
  'promotional',
  'low',
  '2025-12-07',
  'marketing',
  'Treat the target model as optional once the drafter is warm.',
  'This post removes the verification story and should not be used as durable evidence.',
  'speculative decoding | target model | marketing'
);

COMMIT;
