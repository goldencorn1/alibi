BEGIN;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS investigation_runs (
  run_id uuid PRIMARY KEY,
  input_digest char(64) NOT NULL,
  mode text NOT NULL CHECK (mode IN ('live','recorded')),
  data_status text NOT NULL CHECK (data_status IN ('live','recorded','synthetic','cached')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  retention_until timestamptz
);
CREATE TABLE IF NOT EXISTS evidence_documents (
  document_id text PRIMARY KEY,
  run_id uuid REFERENCES investigation_runs(run_id) ON DELETE CASCADE,
  source_url text NOT NULL,
  title text NOT NULL,
  published_at timestamptz,
  retrieved_at timestamptz NOT NULL,
  data_status text NOT NULL,
  content_digest char(64) NOT NULL,
  embedding vector(384),
  embedding_model text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS evidence_documents_embedding_idx ON evidence_documents USING hnsw (embedding vector_cosine_ops);
CREATE TABLE IF NOT EXISTS agent_events (
  run_id uuid NOT NULL REFERENCES investigation_runs(run_id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  agent_id text NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL,
  data_status text NOT NULL,
  input_digest char(64) NOT NULL,
  output_artifact text,
  source_count integer,
  coverage numeric,
  retry_count integer NOT NULL DEFAULT 0,
  cost_usd numeric,
  error_code text,
  policy_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  duration_ms integer,
  PRIMARY KEY (run_id, sequence)
);
COMMIT;
