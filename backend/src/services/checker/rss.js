'use strict';

const Parser = require('rss-parser');

const parser = new Parser();
const VERSION_REGEX = /v?(\d+(?:[.\-+]\w+)*)/;

async function check(software) {
  const feed = await parser.parseURL(software.url);
  if (!feed.items || feed.items.length === 0) {
    throw new Error(`No items found in feed: ${software.url}`);
  }

  const latest = feed.items[0];
  const text = latest.title || latest.contentSnippet || '';
  const match = text.match(VERSION_REGEX);

  return {
    version: match ? match[0] : text.trim().slice(0, 100),
    url: latest.link || software.url,
    published_at: latest.pubDate || latest.isoDate,
  };
}

module.exports = { check };
