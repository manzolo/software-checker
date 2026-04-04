'use strict';

const router = require('express').Router();

router.use('/software', require('./software'));
router.use('/notifications', require('./notifications'));
router.use('/push', require('./push'));
router.use('/settings', require('./settings'));

module.exports = router;
