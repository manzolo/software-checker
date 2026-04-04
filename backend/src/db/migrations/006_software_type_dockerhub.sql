ALTER TABLE software DROP CONSTRAINT IF EXISTS software_type_check;
ALTER TABLE software ADD CONSTRAINT software_type_check
  CHECK (type IN ('github', 'rss', 'scrape', 'apt', 'dockerhub'));
