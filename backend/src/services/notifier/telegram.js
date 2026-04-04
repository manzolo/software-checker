'use strict';

const TelegramBot = require('node-telegram-bot-api');
const settingsModel = require('../../models/settings');

async function notify({ software, oldVersion, newVersion }) {
  const token = process.env.TELEGRAM_BOT_TOKEN || await settingsModel.get('telegram_bot_token');
  const chatId = process.env.TELEGRAM_CHAT_ID || await settingsModel.get('telegram_chat_id');

  if (!token || !chatId) {
    console.warn('[notifier/telegram] Token or chat ID not configured, skipping');
    return;
  }

  const bot = new TelegramBot(token, { polling: false });
  const text = `🔔 *${software.name}* — nuova versione!\n${oldVersion || '?'} → *${newVersion}*\n${software.url}`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

async function sendTest() {
  const token = process.env.TELEGRAM_BOT_TOKEN || await settingsModel.get('telegram_bot_token');
  const chatId = process.env.TELEGRAM_CHAT_ID || await settingsModel.get('telegram_chat_id');

  if (!token || !chatId) throw new Error('Telegram token or chat ID not configured');

  const bot = new TelegramBot(token, { polling: false });
  await bot.sendMessage(chatId, '✅ Software Checker: connessione Telegram funzionante!');
}

module.exports = { notify, sendTest };
