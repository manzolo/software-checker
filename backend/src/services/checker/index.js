'use strict';

const github = require('./github');
const scraper = require('./scraper');
const rss = require('./rss');
const apt = require('./apt');
const dockerhub = require('./dockerhub');
const softwareModel = require('../../models/software');

const checkers = { github, scrape: scraper, rss, apt, dockerhub };

async function checkSoftware(software) {
  const checker = checkers[software.type];
  if (!checker) throw new Error(`Unknown checker type: ${software.type}`);

  let result;
  try {
    result = await checker.check(software);
  } catch (err) {
    await softwareModel.updateCheckError(software.id, err.message);
    throw err;
  }

  await softwareModel.updateChecked(software.id, result.version);

  // Confronta con last_version (confermata dall'utente), non con latest_found (cache).
  // - last_version = null → prima scoperta, popola silenziosamente senza notificare
  // - last_version != result.version → versione cambiata rispetto a quella confermata
  // - result.version != latest_found → versione non ancora notificata (evita duplicati se l'utente non ha fatto acknowledge)
  const isNewVersion = software.last_version !== null
    && result.version !== software.last_version
    && result.version !== software.latest_found;

  return {
    ...result,
    previousVersion: software.last_version,
    isNewVersion,
  };
}

module.exports = { checkSoftware };
