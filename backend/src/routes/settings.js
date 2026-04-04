'use strict';

const router = require('express').Router();
const settingsModel = require('../models/settings');
const telegramNotifier = require('../services/notifier/telegram');
const webpushNotifier = require('../services/notifier/webpush');

const SENSITIVE = ['vapid_private_key'];

router.get('/', async (req, res, next) => {
  try {
    const all = await settingsModel.getAll();
    SENSITIVE.forEach(k => { if (all[k]) all[k] = '***'; });
    res.json(all);
  } catch (err) { next(err); }
});

router.put('/', async (req, res, next) => {
  try {
    const allowed = [
      'telegram_bot_token', 'telegram_chat_id',
      'vapid_subject', 'notify_telegram', 'notify_webpush', 'notify_inapp',
    ];
    const pairs = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) pairs[key] = req.body[key];
    }
    await settingsModel.setMany(pairs);
    res.json({ updated: Object.keys(pairs) });
  } catch (err) { next(err); }
});

router.post('/test-telegram', async (req, res, next) => {
  try {
    await telegramNotifier.sendTest();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/test-webpush', async (req, res, next) => {
  try {
    await webpushNotifier.sendTest();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
