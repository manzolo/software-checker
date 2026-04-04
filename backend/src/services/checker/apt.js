'use strict';

const axios = require('axios');

/**
 * Parses a Debian Packages file and finds all versions of a given package.
 * Returns the highest stable version (no ~ pre-release marker).
 */
function parsePackages(text, packageName) {
  const versions = [];
  const blocks = text.split(/\n\n+/);

  for (const block of blocks) {
    const pkgMatch = block.match(/^Package:\s*(.+)$/m);
    if (!pkgMatch || pkgMatch[1].trim() !== packageName) continue;

    const verMatch = block.match(/^Version:\s*(.+)$/m);
    if (!verMatch) continue;

    const version = verMatch[1].trim();
    // Skip pre-release versions (containing ~)
    if (version.includes('~')) continue;

    versions.push(version);
  }

  if (versions.length === 0) return null;

  // Sort by semver-like comparison and return the highest
  versions.sort((a, b) => {
    const partsA = a.split(/[.\-]/).map(p => (isNaN(p) ? p : parseInt(p, 10)));
    const partsB = b.split(/[.\-]/).map(p => (isNaN(p) ? p : parseInt(p, 10)));
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const pa = partsA[i] ?? 0;
      const pb = partsB[i] ?? 0;
      if (pa < pb) return -1;
      if (pa > pb) return 1;
    }
    return 0;
  });

  return versions[versions.length - 1];
}

async function check(software) {
  const packageName = (software.css_selector || '').trim();
  if (!packageName) {
    throw new Error('Package name required in the "CSS Selector" field for apt type');
  }

  const { data: text } = await axios.get(software.url, {
    timeout: 15000,
    headers: { 'User-Agent': 'software-checker/1.0' },
    responseType: 'text',
  });

  const version = parsePackages(text, packageName);
  if (!version) {
    throw new Error(`Package "${packageName}" not found in ${software.url}`);
  }

  return { version, url: software.url };
}

module.exports = { check };
