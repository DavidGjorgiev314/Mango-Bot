const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const subsPath = path.join(__dirname, '../data/fastSubscribers.json');

const CALENDAR_URL = 'https://pravoslavenkalendar.mk/';
const SAINT_ICON_PATH = path.join(__dirname, '../assets/jesus.png');
const SAINT_ICON_NAME = path.basename(SAINT_ICON_PATH);

const FAST_EMOJIS = {
  'Не се пости': ':cut_of_meat:',
  'Строг пост': ':salad:',
  'Масло': ':olive:',
  'Риба': ':fish:',
  'Без месо': ':cheese:',
  '✱': ':no_entry_sign:',
};

const DEFAULT_EMOJI = ':fork_and_knife:';

const MOON_PHASE_SYMBOLS = /[ⵔ⬤◑◐◒◓◔◕○◯●]/g;

function getTodayDayOfMonth() {
  return String(
    Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Skopje',
        day: 'numeric',
      }).format(new Date())
    )
  );
}

function extractSaints($, cell) {
  let out = '';

  const walk = (node) => {
    if (node.type === 'text') {
      out += node.data;
      return;
    }
    if (node.type !== 'tag') return;

    if (node.name === 'strong' || node.name === 'b') {
      const inner = $(node).text().replace(/\s+/g, ' ').trim();
      if (inner) {
        if (out && !/\s$/.test(out)) out += ' ';
        out += `**${inner}**`;
      }
      return;
    }

    $(node).contents().each((_, child) => walk(child));
  };

  cell.contents().each((_, child) => walk(child));

  return out.replace(MOON_PHASE_SYMBOLS, '').replace(/\s+/g, ' ').trim();
}

async function getTodayFast() {
  const response = await axios.get(CALENDAR_URL);
  const $ = cheerio.load(response.data);

  const row = $(`tr[id="${getTodayDayOfMonth()}"]`).first();
  if (!row.length) return null;

  const cells = row.find('td');
  if (cells.length < 5) return null;

  const saints = extractSaints($, cells.eq(3));
  const fast = cells.eq(4).text().trim();
  if (!fast) return null;

  return { saints, fast };
}

module.exports = async function sendDailyFast(client) {
  if (!fs.existsSync(subsPath)) return;

  const subscribers = JSON.parse(fs.readFileSync(subsPath));
  if (!subscribers.length) return;

  let today;
  try {
    today = await getTodayFast();
  } catch (err) {
    console.error('Failed to fetch fasting rule:', err.message);
    return;
  }

  if (!today || !today.fast) {
    console.error("Failed to parse today's fasting rule from the calendar.");
    return;
  }

  const emoji = FAST_EMOJIS[today.fast] || DEFAULT_EMOJI;

  const embed = new EmbedBuilder()
    .setColor(0xb6924a)
    .setTitle('✞ Правило на пост за денес')
    .setDescription(
      `${emoji} **${today.fast}**` +
        (today.saints ? `\n\n✞ **Празник:** ${today.saints}` : '')
    );

  const hasIcon = fs.existsSync(SAINT_ICON_PATH);
  if (hasIcon) {
    embed.setThumbnail(`attachment://${SAINT_ICON_NAME}`);
  }

  for (const userId of subscribers) {
    try {
      const user = await client.users.fetch(userId);
      const files = hasIcon
        ? [new AttachmentBuilder(SAINT_ICON_PATH, { name: SAINT_ICON_NAME })]
        : [];
      await user.send({ embeds: [embed], files });
    } catch (err) {
      console.error(`Failed to send daily fast to users:`, err.message);
      return;
    }
  }
};
