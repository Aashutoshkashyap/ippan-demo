-- Keep new private working editions outside the legacy operational document.
-- Older release URLs read only platform_state and must not see editorial data.
BEGIN;
CREATE TABLE IF NOT EXISTS ippan_demo.editorial_state (
  id integer PRIMARY KEY CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(data) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO ippan_demo.editorial_state (id, data)
SELECT id, coalesce(data->'cmsRevisions', '[]'::jsonb)
FROM ippan_demo.platform_state WHERE id=1
ON CONFLICT (id) DO NOTHING;
UPDATE ippan_demo.platform_state SET data=data-'cmsRevisions' WHERE data ? 'cmsRevisions';

CREATE OR REPLACE FUNCTION ippan_demo.protect_editorial_boundary()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.data ? 'cmsRevisions' THEN
    IF NEW.data->'cmsRevisions' <> '[]'::jsonb THEN
      RAISE EXCEPTION 'Use the current IPPAN release to save private editorial editions';
    END IF;
    NEW.data := NEW.data - 'cmsRevisions';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_editorial_boundary ON ippan_demo.platform_state;
CREATE TRIGGER protect_editorial_boundary BEFORE INSERT OR UPDATE ON ippan_demo.platform_state
FOR EACH ROW EXECUTE FUNCTION ippan_demo.protect_editorial_boundary();
COMMIT;
