const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');

const paths = {
  levels: path.join(dataDir, 'levels.json'),
  localLevels: path.join(dataDir, 'localLevels.json'),
  meta: path.join(dataDir, 'meta.json'),
  ownerSummary: path.join(dataDir, 'ownerSummary.json'),
};

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read ${path.basename(filePath)} (using fallback):`, err.message);
    return fallback;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Failed to write ${path.basename(filePath)}:`, err.message);
    return false;
  }
}

const levels = readJson(paths.levels, {});
const localLevels = readJson(paths.localLevels, {});
let meta = readJson(paths.meta, { lastActivityUser: null, lastActivityDate: null });

function getMeta() {
  return meta;
}

function saveMeta() {
  return writeJson(paths.meta, meta);
}

function saveLevels() {
  return writeJson(paths.levels, levels);
}

function saveLocalLevels() {
  return writeJson(paths.localLevels, localLevels);
}

module.exports = {
  paths,
  levels,
  localLevels,
  getMeta,
  saveMeta,
  saveLevels,
  saveLocalLevels,
  readJson,
  writeJson,
};
