'use strict';

const inapp = require('./inapp');
const telegram = require('./telegram');
const webpushNotifier = require('./webpush');
const settingsModel = require('../../models/settings');

async function notify({ software, oldVersion, newVersion }) {
  const settings = await settingsModel.getAll();
  const channels = (software.notify_channels || 'inapp').split(',').map(s => s.trim());

  const tasks = [];

  if (channels.includes('inapp')) {
    tasks.push(inapp.notify({ software, oldVersion, newVersion }));
  }
  if (channels.includes('telegram') && settings.notify_telegram === 'true') {
    tasks.push(telegram.notify({ software, oldVersion, newVersion }));
  }
  if (channels.includes('webpush') && settings.notify_webpush === 'true') {
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
