'use strict';

const axios = require('axios');

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
    const { data } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      { headers, timeout: 10000 }
    );
    return { version: data.tag_name, published_at: data.published_at, url: data.html_url };
  } catch (err) {
    if (err.response?.status === 404) {
      // No formal releases — try latest tag
      const { data: tags } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/tags`,
        { headers, timeout: 10000 }
      );
      if (tags.length > 0) {
        return { version: tags[0].name, url: software.url };
      }
      throw new Error(`No releases or tags found for ${owner}/${repo}`);
    }
    if (err.response?.status === 403 || err.response?.status === 429) {
      const reset = err.response.headers['x-ratelimit-reset'];
      throw new Error(`GitHub rate limit exceeded. Resets at: ${reset ? new Date(reset * 1000).toISOString() : 'unknown'}`);
    }
    throw err;
  }
}

module.exports = { check };
