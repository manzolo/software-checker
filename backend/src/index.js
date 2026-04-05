'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { testConnection } = require('./config/database');
const { migrate } = require('./db/migrate');
const webpushConfig = require('./config/webpush');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const scheduler = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const VERSION = (() => {
  try {
    return fs.readFileSync(path.join(__dirname, '../../VERSION'), 'utf8').trim();
  } catch {
    return 'unknown';
  }
})();

app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', uptime: Math.floor(process.uptime()), version: VERSION });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', version: VERSION });
  }
});

app.use('/api', routes);
app.use(errorHandler);

async function start() {
  try {
    await testConnection();
    console.log('[db] Connected');
    await migrate();
    await webpushConfig.init();
    app.listen(PORT, () => {
      console.log(`[server] Listening on port ${PORT}`);
      scheduler.init();
    });
  } catch (err) {
    console.error('[startup] Fatal error:', err.message);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down');
  process.exit(0);
});

start();
