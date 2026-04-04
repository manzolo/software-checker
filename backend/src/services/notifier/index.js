'use strict';

const inapp = require('./inapp');
const telegram = require('./telegram');
const webpushNotifier = require('./webpush');
const settingsModel = require('../../models/settings');

async function notify({ software, oldVersion, newVersion }) {
  const settings = await settingsModel.getAll();

  const tasks = [inapp.notify({ software, oldVersion, newVersion })];

  if (settings.notify_telegram === 'true') {
    tasks.push(telegram.notify({ software, oldVersion, newVersion }));
  }
  if (settings.notify_webpush === 'true') {
    tasks.push(webpushNotifier.notify({ software, oldVersion, newVersion }));
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[notifier] channel ${i} failed:`, r.reason?.message);
    }
  });
}

module.exports = { notify };
