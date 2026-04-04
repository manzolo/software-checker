'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err.message);
});

async function testConnection() {
  const client = await pool.connect();
  client.release();
}

module.exports = { pool, testConnection };
