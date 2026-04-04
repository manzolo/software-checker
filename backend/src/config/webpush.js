'use strict';

const webpush = require('web-push');
const settingsModel = require('../models/settings');

async function init() {
  let publicKey = process.env.VAPID_PUBLIC_KEY || await settingsModel.get('vapid_public_key');
  let privateKey = process.env.VAPID_PRIVATE_KEY || await settingsModel.get('vapid_private_key');
  const subject = process.env.VAPID_SUBJECT || await settingsModel.get('vapid_subject') || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    console.log('[webpush] Generating new VAPID keys...');
    const keys = webpush.generateVAPIDKeys();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    await settingsModel.set('vapid_public_key', publicKey);
    await settingsModel.set('vapid_private_key', privateKey);
    console.log('[webpush] VAPID keys generated and saved');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey };
}

module.exports = { init };
