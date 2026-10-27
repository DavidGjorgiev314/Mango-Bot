const axios = require('axios');
const cheerio = require('cheerio');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const {
  levels,
  localLevels,
  getMeta,
  saveMeta,
  saveLevels,
  saveLocalLevels,
} = require('./store');
const { ensureProfile, awardXp, awardLocalXp } = require('./leveling');
const { todayKey, isSameDay } = require('./time');
const { updateOwnerSummary } = require('./ownerSummary');
const { loadCounter } = require('../ready');

const READ_GIF = 'https://tenor.com/view/the-chosen-os-escolhidos-los-elegidos-jonathan-roumie-jesus-the-chosen-gif-1127020769398794637';
const DOUBLE_XP_GIF = 'https://tenor.com/view/the-chosen-jesus-andrew-simon-dancing-gif-18185342';
const LEVEL_UP_GIF = 'https://tenor.com/view/chosen-jesus-pointing-up-gif-20444572';

function nextVerseCountdown() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 0, 0, 0);
  if (now >= next) next.setDate(next.getDate() + 1);

  const msLeft = next - now;
  return {
    hours: Math.floor(msLeft / (1000 * 60 * 60)),
    minutes: Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

async function handleButton(interaction) {
  const userId = interaction.user.id;
  const userData = ensureProfile(levels, userId);

  if (interaction.customId === 'daily_embed_xp') return handleRead(interaction, userId, userData);
  if (interaction.customId === 'translate') return handleTranslate(interaction);
  if (interaction.customId === 'reflect') return handleReflect(interaction);
}

async function handleRead(interaction, userId, userData) {
  const embedDate = new Date(interaction.message.createdTimestamp);

  if (!isSameDay(embedDate, new Date())) {
    const { hours, minutes } = nextVerseCountdown();
    return interaction.reply({
      content: `⛔ This verse is from a previous day.\n🕒 Next bible verse in **${hours}h ${minutes}m**.`,
      flags: 64,
    });
  }

  const todayStr = todayKey();

  if (userData.lastDailyClaim === todayStr) {
    return interaction.reply({
      content: `⛔ You already collected today's XP in **${userData.lastDailyClaimServer}**.`,
      flags: 64,
    });
  }

  // Mark the claim synchronously, before any await, so a rapid double-click
  // cannot pass the guard twice and award XP.
  userData.lastDailyClaim = todayStr;
  userData.lastDailyClaimServer = interaction.guild?.name ?? 'your server';

  const meta = getMeta();
  meta.lastActivityUser = userId;
  meta.lastActivityDate = new Date().toISOString();

  await interaction.deferReply({ flags: 64 });

  const verseCount = loadCounter();
  const isDoubleXp = verseCount % 5 === 0;
  const xpGain = isDoubleXp ? 100 : 50;

  const { leveledUp, level } = awardXp(userData, xpGain);
  awardLocalXp(localLevels, interaction.guild?.id, userId, xpGain);

  let reply;
  if (leveledUp) {
    reply = `${LEVEL_UP_GIF} \n# 🚀 You leveled up to level ${level}!`;
  } else if (isDoubleXp) {
    reply = `${DOUBLE_XP_GIF} \n# 📖 Nice **+${xpGain} XP** (DOUBLE XP 👀)`;
  } else {
    reply = `${READ_GIF} \n# 📖 Nice 😁 **+${xpGain} XP**`;
  }

  // Persist first so a failure in the (non-critical) owner summary can never
  // lose the XP that was just earned.
  saveMeta();
  saveLevels();
  saveLocalLevels();

  await updateOwnerSummary(interaction.client, levels, meta);

  return interaction.editReply({ content: reply });
}

async function handleTranslate(interaction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const response = await axios.get('https://www.bible.com/mk/verse-of-the-day', {
      timeout: 15000,
    });
    const $ = cheerio.load(response.data);

    const verseText = $('div[class*="border"] a').first().text().trim();
    const verseReference = $('div[class*="border"] p').first().text().trim();

    return interaction.editReply({
      content: `📖 **${verseReference}**\n${verseText}`,
      flags: 64,
    });
  } catch (error) {
    console.error('Failed to fetch translated verse:', error.message);
    return interaction.editReply({
      content: '❌ Could not fetch the translated verse right now. Please try again later.',
      flags: 64,
    });
  }
}

async function handleReflect(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('reflect_modal')
    .setTitle('Daily Bible Reflection ✝️');

  const input = new TextInputBuilder()
    .setCustomId('reflection_text')
    .setLabel('What does this verse mean to you today?')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(20)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return interaction.showModal(modal);
}

async function handleModal(interaction) {
  if (interaction.customId !== 'reflect_modal') return;

  const userId = interaction.user.id;
  const todayStr = todayKey();
  const userData = ensureProfile(levels, userId);

  const embedDate = new Date(interaction.message?.createdTimestamp ?? Date.now());
  const sameDay = isSameDay(embedDate, new Date());

  const reflection = interaction.fields.getTextInputValue('reflection_text');

  const verseReference =
    interaction.message?.embeds?.[0]?.description
      ?.split('\n')[0]
      ?.replace('📖 **', '')
      ?.replace('**', '') || 'Unknown Verse';

  await interaction.deferReply({ flags: 64 });

  let xpAwarded = false;

  if (sameDay && userData.lastReflection !== todayStr) {
    const xpGain = 20;
    userData.lastReflection = todayStr;

    awardXp(userData, xpGain);
    awardLocalXp(localLevels, interaction.guild?.id, userId, xpGain);
    xpAwarded = true;
  }

  const meta = getMeta();
  meta.lastActivityUser = userId;
  meta.lastActivityDate = new Date().toISOString();

  saveMeta();
  saveLevels();
  saveLocalLevels();

  await updateOwnerSummary(interaction.client, levels, meta);

  try {
    await interaction.user.send(
      `✝️ **Daily Bible Reflection**\n\n📖 Verse:**${verseReference}**\n\n✍️ **Your reflection:**\n${reflection}`
    );
  } catch (err) {
    console.error('Failed to DM reflection:', err.message);
  }

  return interaction.editReply({
    content: xpAwarded
      ? '🙏 Reflection saved in your DMs. **+20 XP**'
      : '🙏 Reflection saved in your DMs.',
  });
}

module.exports = { handleButton, handleModal };
