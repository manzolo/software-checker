'use strict';

const webpush = require('web-push');
const pushSubscriptionModel = require('../../models/pushSubscription');

async function notify({ software, oldVersion, newVersion }) {
  const subscriptions = await pushSubscriptionModel.findAll();
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: `Nuova versione: ${software.name}`,
    body: `${oldVersion || '?'} → ${newVersion}`,
    url: software.url,
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch(async (err) => {
        if (err.statusCode === 410) {
          console.log(`[notifier/webpush] Removing expired subscription: ${sub.endpoint}`);
          await pushSubscriptionModel.remove(sub.endpoint);
        }
        throw err;
      })
    )
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) console.warn(`[notifier/webpush] ${failed}/${subscriptions.length} push(es) failed`);
}

async function sendTest() {
  const subscriptions = await pushSubscriptionModel.findAll();
  if (subscriptions.length === 0) throw new Error('No push subscriptions registered');

  const payload = JSON.stringify({
    title: 'Software Checker',
    body: 'Test Web Push funzionante!',
    url: '/',
  });

  await Promise.all(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );
}

module.exports = { notify, sendTest };
