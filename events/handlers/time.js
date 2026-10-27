const TIMEZONE = 'Europe/Skopje';

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function todayKey() {
  return dateKey();
}

function isSameDay(dateA, dateB) {
  return dateKey(dateA) === dateKey(dateB);
}

function formatEU(dateStr) {
  if (!dateStr) return 'Never';
  if (dateStr === todayKey()) return 'Today';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

module.exports = {
  TIMEZONE,
  dateKey,
  todayKey,
  isSameDay,
  formatEU,
};
