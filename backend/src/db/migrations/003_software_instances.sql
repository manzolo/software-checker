CREATE TABLE IF NOT EXISTS software_instances (
  id               SERIAL PRIMARY KEY,
  software_id      INTEGER NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  deployed_version VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instances_software_id ON software_instances(software_id);
