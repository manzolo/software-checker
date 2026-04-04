'use strict';

const { pool } = require('../config/database');

async function getAll() {
  const { rows } = await pool.query(`SELECT key, value FROM settings ORDER BY key`);
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

async function get(key) {
  const { rows } = await pool.query(`SELECT value FROM settings WHERE key = $1`, [key]);
  return rows[0]?.value ?? null;
}

async function set(key, value) {
  await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value]
  );
}

async function setMany(pairs) {
  for (const [key, value] of Object.entries(pairs)) {
    await set(key, value);
  }
}

module.exports = { getAll, get, set, setMany };
