'use strict';

const router = require('express').Router();
const softwareModel = require('../models/software');
const instanceModel = require('../models/instance');
const checker = require('../services/checker/index');
const notifier = require('../services/notifier/index');
const scheduler = require('../services/scheduler');
const { validateSoftware } = require('../middleware/validate');

router.get('/', async (req, res, next) => {
  try {
    res.json(await softwareModel.findAll());
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await softwareModel.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.post('/', validateSoftware, async (req, res, next) => {
  try {
    const { name, url, type, check_interval, css_selector } = req.body;
    const row = await softwareModel.create({ name: name.trim(), url, type, check_interval, css_selector });
    scheduler.rescheduleAll();
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const row = await softwareModel.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    scheduler.rescheduleAll();
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await softwareModel.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    scheduler.rescheduleAll();
    res.status(204).end();
  } catch (err) { next(err); }
});

router.post('/check-all', async (req, res, next) => {
  try {
    const items = await softwareModel.findActive();
    const results = [];
    for (const software of items) {
      try {
        const result = await checker.checkSoftware(software);
        if (result.isNewVersion) {
          await notifier.notify({ software, oldVersion: result.previousVersion, newVersion: result.version });
        }
        results.push({ id: software.id, name: software.name, version: result.version, isNewVersion: result.isNewVersion });
      } catch (err) {
        results.push({ id: software.id, name: software.name, error: err.message });
      }
    }
    res.json(results);
  } catch (err) { next(err); }
});

router.post('/acknowledge-all', async (req, res, next) => {
  try {
    const rows = await softwareModel.acknowledgeAll();
    res.json({ acknowledged: rows.length, items: rows });
  } catch (err) { next(err); }
});

router.post('/:id/check', async (req, res, next) => {
  try {
    const software = await softwareModel.findById(req.params.id);
    if (!software) return res.status(404).json({ error: 'Not found' });
    const result = await checker.checkSoftware(software);
    if (result.isNewVersion) {
      await notifier.notify({ software, oldVersion: result.previousVersion, newVersion: result.version });
    }
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/acknowledge', async (req, res, next) => {
  try {
    const row = await softwareModel.acknowledge(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

// --- Instances ---

router.get('/:id/instances', async (req, res, next) => {
  try {
    const rows = await instanceModel.findBySoftware(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/:id/instances', async (req, res, next) => {
  try {
    const { name, deployed_version } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    const row = await instanceModel.create(req.params.id, { name: name.trim(), deployed_version });
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.put('/:id/instances/:iid', async (req, res, next) => {
  try {
    const row = await instanceModel.update(req.params.iid, req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/:id/instances/:iid', async (req, res, next) => {
  try {
    const ok = await instanceModel.remove(req.params.iid);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
