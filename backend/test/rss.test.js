'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Parser = require('rss-parser');

test('selects the latest stable GitLab release and ignores release candidates', async (t) => {
  t.mock.method(Parser.prototype, 'parseURL', async () => ({
    items: [
      { title: 'GitLab 18.2.0-rc1 released', link: 'https://example.test/rc' },
      { title: 'GitLab 18.1.2 released', link: 'https://example.test/stable' },
      { title: 'GitLab 18.1.1-ee released', link: 'https://example.test/older' },
    ],
  }));
  const rss = require('../src/services/checker/rss');

  const result = await rss.check({ url: 'https://about.gitlab.com/releases.xml' });

  assert.equal(result.version, '18.1.2');
  assert.equal(result.url, 'https://example.test/stable');
});

test('does not return feed text when only prereleases are present', async (t) => {
  t.mock.method(Parser.prototype, 'parseURL', async () => ({
    items: [{ title: 'GitLab 18.2.0-rc1 released' }],
  }));
  const rss = require('../src/services/checker/rss');

  await assert.rejects(
    rss.check({ url: 'https://about.gitlab.com/releases.xml' }),
    /No stable versions found/
  );
});
