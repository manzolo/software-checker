'use strict';

const axios = require('axios');

// Tags to ignore regardless of content
const IGNORED_TAGS = new Set(['latest', 'edge', 'nightly', 'stable', 'beta', 'alpha']);

// Regex for a clean semver-like tag (e.g. 0.20.2, 1.2.3, v1.2.3)
// Excludes variants (rocm, arm64, etc.) and pre-releases (-rc, -beta, -alpha, -dev)
const STABLE_SEMVER = /^v?(\d+\.\d+(?:\.\d+)*)$/;

/**
 * Parse namespace and image name from various URL formats:
 *   https://hub.docker.com/r/ollama/ollama
 *   https://hub.docker.com/r/library/nginx
 *   ollama/ollama
 *   nginx  (official image → library/nginx)
 */
function parseImage(url) {
  let path = url;

  // Strip hub.docker.com/r/ prefix if present
  const match = url.match(/hub\.docker\.com\/r\/([^/?#]+(?:\/[^/?#]+)?)/);
  if (match) {
    path = match[1];
  }

  const parts = path.split('/').filter(Boolean);
  if (parts.length === 1) return { namespace: 'library', image: parts[0] };
  if (parts.length >= 2) return { namespace: parts[0], image: parts[1] };
  throw new Error(`Cannot parse Docker Hub image from: ${url}`);
}

async function check(software) {
  const { namespace, image } = parseImage(software.url);

  // Fetch up to 100 tags ordered by last_updated to find the latest stable one
  const { data } = await axios.get(
    `https://hub.docker.com/v2/repositories/${namespace}/${image}/tags`,
    {
      params: { ordering: 'last_updated', page_size: 100 },
      timeout: 15000,
      headers: { 'User-Agent': 'software-checker/1.0' },
    }
  );

  const stableTag = (data.results || [])
    .map(t => t.name)
    .find(name => !IGNORED_TAGS.has(name) && STABLE_SEMVER.test(name));

  if (!stableTag) {
    throw new Error(`No stable semver tag found for ${namespace}/${image}`);
  }

  return {
    version: stableTag,
    url: `https://hub.docker.com/r/${namespace}/${image}`,
  };
}

module.exports = { check };
