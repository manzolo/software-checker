'use strict';

const { pool } = require('../config/database');

async function findAll() {
  const { rows } = await pool.query(
    `SELECT s.*,
            COALESCE(json_agg(i.* ORDER BY i.name ASC) FILTER (WHERE i.id IS NOT NULL), '[]') AS instances
     FROM software s
     LEFT JOIN software_instances i ON i.software_id = s.id
     GROUP BY s.id
     ORDER BY s.name ASC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM software WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, url, type, check_interval, css_selector, notify_channels }) {
  const { rows } = await pool.query(
    `INSERT INTO software (name, url, type, check_interval, css_selector, notify_channels)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, url, type, check_interval || 'daily', css_selector || null, notify_channels || 'inapp']
  );
  return rows[0];
}

async function update(id, { name, url, type, check_interval, css_selector, is_active, last_version, notify_channels }) {
  // last_version e css_selector: undefined = non toccato, "" = reset a NULL, string = valore esplicito.
  // Serve per i PUT parziali (es. toggleActive manda solo is_active): senza il flag,
  // css_selector veniva azzerato e i check apt/scrape si rompevano.
  const lastVersionValue = last_version === undefined
    ? undefined  // handled below
    : (last_version === '' ? null : last_version);
  const cssSelectorValue = css_selector === undefined
    ? null  // ignorato: il flag $5 è false
    : (css_selector === '' ? null : css_selector);

  const { rows } = await pool.query(
    `UPDATE software
     SET name = COALESCE($1, name),
         url = COALESCE($2, url),
         type = COALESCE($3, type),
         check_interval = COALESCE($4, check_interval),
         css_selector = CASE WHEN $5::boolean THEN $6 ELSE css_selector END,
         is_active = COALESCE($7, is_active),
         last_version = CASE WHEN $8::boolean THEN $9 ELSE last_version END,
         notify_channels = COALESCE($11, notify_channels),
         updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [
      name, url, type, check_interval,
      css_selector !== undefined,  // $5: flag "aggiorna css_selector?"
      cssSelectorValue,            // $6: valore (può essere null per reset)
      is_active,
      last_version !== undefined,  // $8: flag "aggiorna last_version?"
      lastVersionValue,            // $9: valore (può essere null per reset)
      id,
      notify_channels ?? null,
    ]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM software WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

async function updateChecked(id, latestFound) {
  const { rows } = await pool.query(
    `UPDATE software
     SET latest_found = $1,
         last_checked_at = NOW(),
         last_check_error = NULL,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [latestFound, id]
  );
  return rows[0] || null;
}

async function updateCheckError(id, errorMessage) {
  const { rows } = await pool.query(
    `UPDATE software
     SET last_checked_at = NOW(),
         last_check_error = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [errorMessage, id]
  );
  return rows[0] || null;
}

async function acknowledge(id) {
  const { rows } = await pool.query(
    `UPDATE software
     SET last_version = latest_found,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function acknowledgeAll() {
  const { rows } = await pool.query(
    `UPDATE software
     SET last_version = latest_found,
         updated_at = NOW()
     WHERE latest_found IS DISTINCT FROM last_version
     RETURNING *`
  );
  return rows;
}

async function findActive() {
  const { rows } = await pool.query(
    `SELECT * FROM software WHERE is_active = TRUE ORDER BY id ASC`
  );
  return rows;
}

module.exports = { findAll, findById, create, update, remove, updateChecked, updateCheckError, acknowledge, acknowledgeAll, findActive };
