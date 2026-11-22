-- Forward-only, dedicated IPPAN namespace. No legacy schemas or records are touched.
BEGIN;
CREATE SCHEMA IF NOT EXISTS ippan_demo;
CREATE TABLE IF NOT EXISTS ippan_demo.platform_state (
 id integer PRIMARY KEY CHECK (id=1),
 data jsonb NOT NULL CHECK (jsonb_typeof(data)='object'),
 updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE ippan_demo.platform_state IS 'Isolated demonstration aggregate; row locking makes cross-module transitions atomic. Normalize entities before production scale.';
COMMIT;
