const fs = require('fs');
const path = require('path');

// Updated path to the JSON file in /data folder
const FILE_PATH = path.join(__dirname, '..', 'data', 'birthdays.json');

// Ensure file exists
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({}, null, 2), 'utf8');
}

// Load full JSON
function load() {
  const raw = fs.readFileSync(FILE_PATH, 'utf8') || '{}';
  return JSON.parse(raw); // { guildId: { users: { userId: "DD-MM-YYYY" }, birthdayChannel: "CHANNEL_ID" } }
}

// Save full JSON
function save(obj) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2), 'utf8');
}

// Validate DD-MM-YYYY
function isValidDateDDMMYYYY(dateStr) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr);
  if (!m) return false;

  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);

  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  if (year < 1900 || year > 9999) return false;

  return true;
}

// Parse date
function parseDateDDMMYYYY(dateStr) {
  if (!isValidDateDDMMYYYY(dateStr)) return null;
  const [dd, mm, yyyy] = dateStr.split('-').map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  return { day: dd, month: mm, year: yyyy, date };
}

// Today DD-MM
function todayDDMM() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}`;
}

/* --------- CRUD helpers per guild --------- */

// Set birthday for a user
function setBirthday(guildId, userId, dateStr) {
  if (!isValidDateDDMMYYYY(dateStr)) {
    throw new Error('Invalid date format. Expect DD-MM-YYYY.');
  }
  const data = load();
  if (!data[guildId]) data[guildId] = { users: {} };
  data[guildId].users[userId] = dateStr;
  save(data);
}

// Remove birthday
function removeBirthday(guildId, userId) {
  const data = load();
  if (data[guildId] && data[guildId].users && data[guildId].users[userId]) {
    delete data[guildId].users[userId];
    save(data);
    return true;
  }
  return false;
}

// Get all birthdays for a guild
function getAllBirthdays(guildId) {
  const data = load();
  return (data[guildId] && data[guildId].users) || {};
}

// Get today’s birthdays for a guild
function getTodayBirthdays(guildId) {
  const all = getAllBirthdays(guildId);
  const today = todayDDMM();
  return Object.entries(all).filter(([_, dateStr]) => dateStr.slice(0, 5) === today);
}

// Set birthday channel for a guild
function setBirthdayChannel(guildId, channelId) {
  const data = load();
  if (!data[guildId]) data[guildId] = { users: {} };
  data[guildId].birthdayChannel = channelId;
  save(data);
}

// Get birthday channel for a guild
function getBirthdayChannel(guildId) {
  const data = load();
  if (!data[guildId]) return null;
  return data[guildId].birthdayChannel || null;
}

module.exports = {
  FILE_PATH,
  load,
  save,
  isValidDateDDMMYYYY,
  parseDateDDMMYYYY,
  setBirthday,
  removeBirthday,
  getAllBirthdays,
  getTodayBirthdays,
  setBirthdayChannel,
  getBirthdayChannel,
};