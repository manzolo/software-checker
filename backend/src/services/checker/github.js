'use strict';

const axios = require('axios');

const STABLE_TAG = /^v?(\d+\.\d+(?:\.\d+)*)$/;

function compareVersions(a, b) {
  const normalize = (v) => v.replace(/^v/i, '').split('.').map((s) => {
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
  const parsed = new URL(software.url);
  const parts = parsed.pathname.replace(/^\//, '').split('/');
  if (parts.length < 2) {
    throw new Error(`Invalid GitHub URL: ${software.url}`);
  }
  const [owner, repo] = parts;

  const headers = { 'User-Agent': 'software-checker/1.0' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const { data: releases } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      { headers, timeout: 10000, params: { per_page: 100 } }
    );

    const stable = releases.filter(r => !r.draft && !r.prerelease && STABLE_TAG.test(r.tag_name));
    if (stable.length > 0) {
      const best = stable.reduce((a, b) =>
        compareVersions(a.tag_name, b.tag_name) >= 0 ? a : b
      );
      return { version: best.tag_name, published_at: best.published_at, url: best.html_url };
    }

    // No formal releases — try tags
    const { data: tags } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/tags`,
      { headers, timeout: 10000, params: { per_page: 100 } }
    );

    const stableTags = tags.map(t => t.name).filter(n => STABLE_TAG.test(n));
    if (stableTags.length > 0) {
      const best = stableTags.reduce((a, b) => compareVersions(a, b) >= 0 ? a : b);
      return { version: best, url: software.url };
    }

    if (tags.length > 0) {
      return { version: tags[0].name, url: software.url };
    }

    throw new Error(`No releases or tags found for ${owner}/${repo}`);
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 429) {
      const reset = err.response.headers['x-ratelimit-reset'];
      throw new Error(`GitHub rate limit exceeded. Resets at: ${reset ? new Date(reset * 1000).toISOString() : 'unknown'}`);
    }
    throw err;
  }
}

module.exports = { check };
