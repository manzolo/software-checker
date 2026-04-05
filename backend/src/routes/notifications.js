'use strict';

const router = require('express').Router();
const notificationModel = require('../models/notification');
const sseManager = require('../sse/manager');

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write('retry: 3000\n\n');
  sseManager.addClient(res);
});

router.get('/count', async (req, res, next) => {
  try {
    const unread = await notificationModel.countUnread();
    res.json({ unread });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { unread, limit = 50, offset = 0 } = req.query;
    const rows = await notificationModel.findAll({
      unread: unread === 'true',
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(rows);
  } catch (err) { next(err); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    const count = await notificationModel.markAllRead();
    res.json({ marked: count });
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const row = await notificationModel.markRead(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/all', async (req, res, next) => {
  try {
    const count = await notificationModel.removeAll();
    res.json({ deleted: count });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await notificationModel.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
