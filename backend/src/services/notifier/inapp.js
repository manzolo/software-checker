'use strict';

const notificationModel = require('../../models/notification');
const sseManager = require('../../sse/manager');

async function notify({ software, oldVersion, newVersion }) {
  const message = `${software.name}: ${oldVersion || '?'} → ${newVersion}`;
  const notification = await notificationModel.create({
    software_id: software.id,
    message,
    old_version: oldVersion,
    new_version: newVersion,
  });

  const unread = await notificationModel.countUnread();
  sseManager.broadcast('notification', { notification, softwareName: software.name });
  sseManager.broadcast('count', { unread });

  return notification;
}

module.exports = { notify };
