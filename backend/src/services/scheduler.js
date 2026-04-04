'use strict';

const cron = require('node-cron');
const softwareModel = require('../models/software');
const checker = require('./checker/index');
const notifier = require('./notifier/index');

const INTERVAL_CRON = {
  hourly: '0 * * * *',
  daily:  '0 8 * * *',
  weekly: '0 8 * * 1',
};

const activeTasks = new Map(); // interval -> cron.Task

async function runChecks(interval) {
  const items = await softwareModel.findActive();
  const targets = items.filter(s => s.check_interval === interval);

  for (const software of targets) {
    try {
      const result = await checker.checkSoftware(software);
      if (result.isNewVersion) {
        console.log(`[scheduler] New version for ${software.name}: ${result.previousVersion} → ${result.version}`);
        await notifier.notify({
          software,
          oldVersion: result.previousVersion,
          newVersion: result.version,
        });
      }
    } catch (err) {
      console.error(`[scheduler] Check failed for ${software.name}:`, err.message);
    }
  }
}

function rescheduleAll() {
  for (const [, task] of activeTasks) {
    task.stop();
  }
  activeTasks.clear();

  for (const [interval, expression] of Object.entries(INTERVAL_CRON)) {
    const task = cron.schedule(expression, () => runChecks(interval), { scheduled: true });
    activeTasks.set(interval, task);
    console.log(`[scheduler] Scheduled "${interval}" checks (${expression})`);
  }
}

function init() {
  rescheduleAll();
}

module.exports = { init, rescheduleAll };
