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

/**
 * Parses an Ubuntu meta-release file (changelogs.ubuntu.com/meta-release-lts).
 * Returns the latest supported release version, stripping the " LTS" suffix.
 */
function parseMetaRelease(text) {
  const blocks = text.split(/\n\n+/);
  let latestVersion = null;

  for (const block of blocks) {
    const supportedMatch = block.match(/^Supported:\s*(.+)$/m);
    if (!supportedMatch || supportedMatch[1].trim() !== '1') continue;

    const verMatch = block.match(/^Version:\s*(.+)$/m);
    if (!verMatch) continue;

    // Strip trailing " LTS" suffix (e.g. "24.04.4 LTS" → "24.04.4")
    latestVersion = verMatch[1].trim().replace(/\s+LTS$/i, '');
  }

  return latestVersion;
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

  // Detect Ubuntu meta-release format (has "Dist:" fields) vs Debian Packages format
  const isMetaRelease = /^Dist:\s*/m.test(text);
  const version = isMetaRelease ? parseMetaRelease(text) : parsePackages(text, packageName);

  if (!version) {
    const target = isMetaRelease ? 'any supported release' : `package "${packageName}"`;
    throw new Error(`Could not find ${target} in ${software.url}`);
  }

  return { version, url: software.url };
}

module.exports = { check };
