'use strict';

const Parser = require('rss-parser');

const parser = new Parser();
const VERSION_REGEX = /v?(\d+(?:[.\-]\d+)*(?:[.\-+][a-zA-Z0-9]+)*)/;
const STRIP_SUFFIX = /-(ee|ce)$/i;
const PRERELEASE_SUFFIX = /(?:^|[.\-+])(rc|alpha|beta|pre|preview|dev|nightly|canary)\d*(?:$|[.\-+])/i;

// Compare two version strings numerically, segment by segment.
// Returns >0 if a > b, <0 if a < b, 0 if equal.
function compareVersions(a, b) {
  const normalize = (v) => v.replace(/^v/i, '').split(/[.\-]/).map((s) => {
    const n = parseInt(s, 10);
    return isNaN(n) ? s : n;
  });
  const pa = normalize(a);
  const pb = normalize(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const sa = pa[i] ?? 0;
    const sb = pb[i] ?? 0;
    if (typeof sa === 'number' && typeof sb === 'number') {
      if (sa !== sb) return sa - sb;
    } else {
      const cmp = String(sa).localeCompare(String(sb));
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

async function check(software) {
  const feed = await parser.parseURL(software.url);
  if (!feed.items || feed.items.length === 0) {
    throw new Error(`No items found in feed: ${software.url}`);
  }

  let best = null;
  let foundVersion = false;

  for (const item of feed.items) {
    const text = item.title || item.contentSnippet || '';
    const match = text.match(VERSION_REGEX);
    if (!match) continue;
    foundVersion = true;
    const version = match[0].replace(STRIP_SUFFIX, '');
    if (PRERELEASE_SUFFIX.test(version)) continue;
    if (!best || compareVersions(version, best.version) > 0) {
      best = {
        version,
        url: item.link || software.url,
        published_at: item.pubDate || item.isoDate,
      };
    }
  }

  if (!best) {
    if (foundVersion) {
      throw new Error(`No stable versions found in feed: ${software.url}`);
    }

    // Fallback: return first item text if no version found anywhere
    const first = feed.items[0];
    const text = first.title || first.contentSnippet || '';
    return {
      version: text.trim().slice(0, 100),
      url: first.link || software.url,
      published_at: first.pubDate || first.isoDate,
    };
  }

  return best;
}

module.exports = { check };
