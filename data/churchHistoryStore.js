// Shared read/write helpers for Church History Progression progress data.
//
// Progress shape:
// {
//   "<userId>": {
//     "badges": ["didache"],
//     "works": {
//       "didache": {
//         "attempts": 1,
//         "bestScore": 8,
//         "lastScore": 8,
//         "lastTaken": "2026-08-25T12:00:00.000Z"
//       }
//     }
//   }
// }

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, 'churchHistoryProgress.json');

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function readProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading churchHistoryProgress.json:', err);
    return {};
  }
}

function writeProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function getUser(progress, userId) {
  if (!progress[userId]) {
    progress[userId] = {
      badges: [],
      works: {},
    };
  }

  if (!Array.isArray(progress[userId].badges)) {
    progress[userId].badges = [];
  }

  if (!progress[userId].works || typeof progress[userId].works !== 'object') {
    progress[userId].works = {};
  }

  return progress[userId];
}

function getWorkStats(userData, workId) {
  if (!userData.works[workId]) {
    userData.works[workId] = {
      attempts: 0,
      bestScore: 0,
      lastScore: 0,
      lastTaken: null,
    };
  }

  return userData.works[workId];
}

function hasBadge(userData, workId) {
  return Array.isArray(userData.badges) && userData.badges.includes(workId);
}

function getCooldownRemainingMs(userData, workId) {
  const stats = getWorkStats(userData, workId);

  if (!stats.lastTaken) {
    return 0;
  }

  const elapsed = Date.now() - new Date(stats.lastTaken).getTime();
  if (elapsed >= COOLDOWN_MS) {
    return 0;
  }

  return COOLDOWN_MS - elapsed;
}

function recordAttempt(userData, workId, score, total) {
  const stats = getWorkStats(userData, workId);

  stats.attempts += 1;
  stats.lastScore = score;
  stats.lastTaken = new Date().toISOString();

  if (score > stats.bestScore) {
    stats.bestScore = score;
  }

  if (total > 0 && score / total >= 0.7 && !hasBadge(userData, workId)) {
    userData.badges.push(workId);
    return true;
  }

  return false;
}

module.exports = {
  PROGRESS_FILE,
  COOLDOWN_MS,
  readProgress,
  writeProgress,
  getUser,
  getWorkStats,
  hasBadge,
  getCooldownRemainingMs,
  recordAttempt,
};
