'use strict';

const { pool } = require('../config/database');

async function findAll() {
  const { rows } = await pool.query(
    `SELECT * FROM software ORDER BY name ASC`
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

async function create({ name, url, type, check_interval, css_selector }) {
  const { rows } = await pool.query(
    `INSERT INTO software (name, url, type, check_interval, css_selector)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, url, type, check_interval || 'daily', css_selector || null]
  );
  return rows[0];
}

async function update(id, { name, url, type, check_interval, css_selector, is_active, last_version }) {
  // last_version: undefined = non toccato, "" = reset a NULL, string = valore esplicito
  const lastVersionValue = last_version === undefined
    ? undefined  // handled below
    : (last_version === '' ? null : last_version);

  const { rows } = await pool.query(
    `UPDATE software
     SET name = COALESCE($1, name),
         url = COALESCE($2, url),
         type = COALESCE($3, type),
         check_interval = COALESCE($4, check_interval),
         css_selector = $5,
         is_active = COALESCE($6, is_active),
         last_version = CASE WHEN $7::boolean THEN $8 ELSE last_version END,
         updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      name, url, type, check_interval,
      css_selector ?? null,
      is_active,
      last_version !== undefined,  // $7: flag "aggiorna last_version?"
      lastVersionValue,            // $8: valore (può essere null per reset)
      id,
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
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [latestFound, id]
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

module.exports = { findAll, findById, create, update, remove, updateChecked, acknowledge, acknowledgeAll, findActive };
