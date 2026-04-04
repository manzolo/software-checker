'use strict';

const router = require('express').Router();
const pushSubscriptionModel = require('../models/pushSubscription');
const settingsModel = require('../models/settings');

router.get('/vapid-public-key', async (req, res, next) => {
  try {
    const key = process.env.VAPID_PUBLIC_KEY || await settingsModel.get('vapid_public_key');
    if (!key) return res.status(503).json({ error: 'VAPID not initialized yet' });
    res.json({ publicKey: key });
  } catch (err) { next(err); }
});

router.post('/subscribe', async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }
    const sub = await pushSubscriptionModel.upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth });
    res.status(201).json(sub);
  } catch (err) { next(err); }
});

router.delete('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
    await pushSubscriptionModel.remove(endpoint);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
