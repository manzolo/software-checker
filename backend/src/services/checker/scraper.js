'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const VERSION_REGEX = /v?(\d+(?:[.\-+]\w+)*)/;

async function check(software) {
  const { data: html } = await axios.get(software.url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; software-checker/1.0)',
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(html);
  const text = $(software.css_selector).first().text().trim();

  if (!text) {
    throw new Error(`CSS selector "${software.css_selector}" matched nothing on ${software.url}`);
  }

  const match = text.match(VERSION_REGEX);
  if (!match) {
    throw new Error(`Could not extract version from text: "${text}"`);
  }

  return { version: match[0], url: software.url };
}

module.exports = { check };
