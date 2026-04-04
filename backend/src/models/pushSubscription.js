'use strict';

const { pool } = require('../config/database');

async function upsert({ endpoint, p256dh, auth }) {
  const { rows } = await pool.query(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth)
     VALUES ($1, $2, $3)
     ON CONFLICT (endpoint) DO UPDATE SET p256dh = $2, auth = $3
     RETURNING *`,
    [endpoint, p256dh, auth]
  );
  return rows[0];
}

async function remove(endpoint) {
  const { rowCount } = await pool.query(
    `DELETE FROM push_subscriptions WHERE endpoint = $1`,
    [endpoint]
  );
  return rowCount > 0;
}

async function findAll() {
  const { rows } = await pool.query(`SELECT * FROM push_subscriptions`);
  return rows;
}

module.exports = { upsert, remove, findAll };
