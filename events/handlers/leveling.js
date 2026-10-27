function ensureProfile(levels, userId) {
  if (!levels[userId]) {
    levels[userId] = {
      xp: 0,
      level: 1,
      lastClick: 0,
      totalXp: 0,
      lastDailyClaim: null,
      lastDailyClaimServer: null,
      lastReflection: null,
    };
  }
  return levels[userId];
}

function awardXp(userData, gain) {
  userData.xp += gain;
  userData.totalXp += gain;

  let leveledUp = false;
  const needed = userData.level * 100;
  if (userData.xp >= needed) {
    userData.xp -= needed;
    userData.level += 1;
    leveledUp = true;
  }

  return { leveledUp, level: userData.level };
}

function awardLocalXp(localLevels, guildId, userId, gain) {
  const guildData = guildId && localLevels[guildId];
  if (!guildData || !guildData.enabled) return false;

  if (!guildData.users) guildData.users = {};
  if (!guildData.users[userId]) {
    guildData.users[userId] = { xp: 0, level: 1, totalXp: 0 };
  }

  const localUser = guildData.users[userId];
  localUser.xp += gain;
  localUser.totalXp += gain;

  const needed = localUser.level * 100;
  if (localUser.xp >= needed) {
    localUser.xp -= needed;
    localUser.level += 1;
  }

  return true;
}

module.exports = {
  ensureProfile,
  awardXp,
  awardLocalXp,
};
