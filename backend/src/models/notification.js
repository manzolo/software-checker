'use strict';

const { pool } = require('../config/database');

async function create({ software_id, message, old_version, new_version }) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (software_id, message, old_version, new_version)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [software_id, message, old_version || null, new_version || null]
  );
  return rows[0];
}

async function findAll({ unread, limit = 50, offset = 0 } = {}) {
  let query = `SELECT n.*, s.name AS software_name
               FROM notifications n
               JOIN software s ON s.id = n.software_id`;
  const params = [];
  if (unread) {
    query += ` WHERE n.is_read = FALSE`;
  }
  query += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  const { rows } = await pool.query(query, params);
  return rows;
}

async function countUnread() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE is_read = FALSE`
  );
  return parseInt(rows[0].count, 10);
}

async function markRead(id) {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function markAllRead() {
  const { rowCount } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE`
  );
  return rowCount;
}

async function remove(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM notifications WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

module.exports = { create, findAll, countUnread, markRead, markAllRead, remove };
