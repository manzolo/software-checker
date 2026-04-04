'use strict';

function validateSoftware(req, res, next) {
  const { name, url, type } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('name is required');
  }
  if (!url || typeof url !== 'string') {
    errors.push('url is required');
  } else {
    try { new URL(url); } catch { errors.push('url must be a valid URL'); }
  }
  if (!type || !['github', 'scrape', 'rss', 'apt'].includes(type)) {
    errors.push('type must be one of: github, scrape, rss, apt');
  }
  if (type === 'scrape' && !req.body.css_selector) {
    errors.push('css_selector is required when type is scrape');
  }
  if (type === 'apt' && !req.body.css_selector) {
    errors.push('css_selector (package name) is required when type is apt');
  }
  if (req.body.check_interval && !['hourly', 'daily', 'weekly'].includes(req.body.check_interval)) {
    errors.push('check_interval must be one of: hourly, daily, weekly');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

module.exports = { validateSoftware };
