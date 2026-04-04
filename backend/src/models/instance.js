'use strict';

const { pool } = require('../config/database');

async function findBySoftware(softwareId) {
  const { rows } = await pool.query(
    `SELECT * FROM software_instances WHERE software_id = $1 ORDER BY name ASC`,
    [softwareId]
  );
  return rows;
}

async function create(softwareId, { name, deployed_version }) {
  const { rows } = await pool.query(
    `INSERT INTO software_instances (software_id, name, deployed_version)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [softwareId, name, deployed_version || null]
  );
  return rows[0];
}

async function update(id, { name, deployed_version }) {
  const { rows } = await pool.query(
    `UPDATE software_instances
     SET name = COALESCE($1, name),
         deployed_version = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [name, deployed_version ?? null, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM software_instances WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

module.exports = { findBySoftware, create, update, remove };
