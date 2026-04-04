ALTER TABLE software
  ADD COLUMN IF NOT EXISTS last_check_error TEXT;
