const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const levelsFilePath = path.join(__dirname, '../data/levels.json');
const ownerSummaryPath = path.join(__dirname, '../data/ownerSummary.json');
const { loadCounter } = require('./ready');
const config = require("../config.json");
const summaryChannelId = config.summaryChannelId;
const ownerID = config.ownerID;
const axios = require('axios');
const cheerio = require('cheerio');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatEU(dateStr) {
  if (!dateStr) return "Never";
  if (dateStr === todayKey()) return "Today";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

let levels = {};
if (fs.existsSync(levelsFilePath)) {
  levels = JSON.parse(fs.readFileSync(levelsFilePath));
}

let meta = {
  lastActivityUser: null,
  lastActivityDate: null
};

const metaFilePath = path.join(__dirname, '../data/meta.json');

if (fs.existsSync(metaFilePath)) {
  meta = JSON.parse(fs.readFileSync(metaFilePath));
}


module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {

    /* ===================== OWNER SUMMARY ===================== */

async function updateOwnerSummary(client) {
  let summaryData = { messageId: null };
  if (fs.existsSync(ownerSummaryPath)) {
    summaryData = JSON.parse(fs.readFileSync(ownerSummaryPath));
  }

  const channel = await client.channels.fetch(summaryChannelId);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle("📖 Daily Bible Activity Summary")
    .setColor(0x8b5cf6)
    .setTimestamp();

  for (const [userId, data] of Object.entries(levels)) {
    let displayName = "Unknown User";

    try {
      const user = await client.users.fetch(userId);
      displayName = user.globalName || user.username;
    } catch {}

    const isLastUpdater = userId === meta.lastActivityUser;
    const dot = isLastUpdater ? ' •' : '';

    embed.addFields({
      name: `👤 ${displayName}${dot}`,
      value:
        `📘 Read: **${formatEU(data.lastDailyClaim)}**\n` +
        `✍️ Reflected: **${formatEU(data.lastReflection)}**`,
      inline: false
    });
  }

  if (summaryData.messageId) {
    try {
      const msg = await channel.messages.fetch(summaryData.messageId);
      await msg.edit({ embeds: [embed] });
      return;
    } catch {
      summaryData.messageId = null;
    }
  }

  const sent = await channel.send({ embeds: [embed] });
  summaryData.messageId = sent.id;
  fs.writeFileSync(ownerSummaryPath, JSON.stringify(summaryData, null, 2));
}

    /* ===================== BUTTON INTERACTIONS ===================== */

    if (interaction.isButton()) {
      const userId = interaction.user.id;

      if (!levels[userId]) {
        levels[userId] = {
          xp: 0,
          level: 1,
          lastClick: 0,
          totalXp: 0,
          lastDailyClaim: null,
          lastDailyClaimServer: null,
          lastReflection: null
        };
      }

      const userData = levels[userId];

      /* ---------- READ (XP) ---------- */
      if (interaction.customId === 'daily_embed_xp') {
        const embedDate = new Date(interaction.message.createdTimestamp);
        const today = new Date();

        const isSameDay =
          embedDate.getFullYear() === today.getFullYear() &&
          embedDate.getMonth() === today.getMonth() &&
          embedDate.getDate() === today.getDate();

        const now = new Date();
        const nextVerseTime = new Date(now);
        nextVerseTime.setHours(9, 0, 0, 0);
        if (now >= nextVerseTime) nextVerseTime.setDate(nextVerseTime.getDate() + 1);

        const msLeft = nextVerseTime - now;
        const hours = Math.floor(msLeft / (1000 * 60 * 60));
        const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (!isSameDay) {
          return interaction.reply({
            content:
              `⛔ This verse is from a previous day.\n🕒 Next bible verse in **${hours}h ${minutes}m**.`,
            flags: 64
          });
        }

        const todayStr = todayKey();

        if (userData.lastDailyClaim === todayStr) {
          return interaction.reply({
            content:
              `⛔ You already collected today's XP in **${userData.lastDailyClaimServer}**.`,
            flags: 64
          });
        }

        let xpGain = 50;
        let reply;

        const verseCount = loadCounter();
        if (verseCount % 5 === 0) {
          xpGain = 100;
          reply = `✅ Nice **+${xpGain} XP** (DOUBLE XP 👀)`;
        } else {
          reply = `https://tenor.com/view/the-chosen-os-escolhidos-los-elegidos-jonathan-roumie-jesus-the-chosen-gif-1127020769398794637 \nNice 😁 **+${xpGain} XP**`;
        }

        userData.xp += xpGain;
        userData.totalXp += xpGain;

        const xpNeeded = userData.level * 100;
        if (userData.xp >= xpNeeded) {
          userData.level++;
          userData.xp -= xpNeeded;
          reply = `🚀 You leveled up to level ${userData.level}!`;
        }

        userData.lastDailyClaim = todayStr;
        userData.lastDailyClaimServer = interaction.guild.name;
        meta.lastActivityUser = userId;
        meta.lastActivityDate = new Date().toISOString();

        fs.writeFileSync(metaFilePath, JSON.stringify(meta, null, 2));

        await updateOwnerSummary(interaction.client);

        fs.writeFileSync(levelsFilePath, JSON.stringify(levels, null, 2));
        return interaction.reply({ content: reply, flags: 64 });
      }

      /* ---------- TRANSLATE ---------- */
      if (interaction.customId === 'translate') {
        const url = 'https://www.bible.com/mk/verse-of-the-day';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const verseText = $('div[class*="border"] a').first().text().trim();
        const verseReference = $('div[class*="border"] p').first().text().trim();

        return interaction.reply({
          content: `📖 **${verseReference}**\n${verseText}`,
          flags: 64
        });
      }

      /* ---------- REFLECT (OPEN MODAL) ---------- */
      if (interaction.customId === 'reflect') {
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
    }

    /* ===================== MODAL SUBMIT ===================== */

    if (interaction.isModalSubmit() && interaction.customId === 'reflect_modal') {
      const userId = interaction.user.id;
      const todayStr = todayKey();

      if (!levels[userId]) {
        levels[userId] = {
          xp: 0,
          level: 1,
          lastClick: 0,
          totalXp: 0,
          lastDailyClaim: null,
          lastDailyClaimServer: null,
          lastReflection: null
        };
      }

      const userData = levels[userId];

      const embedDate = new Date(interaction.message.createdTimestamp);
      const today = new Date();
      const isSameDay =
        embedDate.getFullYear() === today.getFullYear() &&
        embedDate.getMonth() === today.getMonth() &&
        embedDate.getDate() === today.getDate();

      const reflection = interaction.fields.getTextInputValue('reflection_text');

      const verseReference =
        interaction.message?.embeds?.[0]?.description
          ?.split('\n')[0]
          ?.replace('📖 **', '')
          ?.replace('**', '') || 'Unknown Verse';

      let xpAwarded = false;

      if (isSameDay && userData.lastReflection !== todayStr) {
        const xpGain = 20;
        userData.xp += xpGain;
        userData.totalXp += xpGain;
        userData.lastReflection = todayStr;
        xpAwarded = true;

        const xpNeeded = userData.level * 100;
        if (userData.xp >= xpNeeded) {
          userData.level++;
          userData.xp -= xpNeeded;
        }
      }
      meta.lastActivityUser = userId;
      meta.lastActivityDate = new Date().toISOString();

      fs.writeFileSync(metaFilePath, JSON.stringify(meta, null, 2));

      fs.writeFileSync(levelsFilePath, JSON.stringify(levels, null, 2));
      await updateOwnerSummary(interaction.client);

      try {
        await interaction.user.send(
          `✝️ **Daily Bible Reflection**\n\n📖 Verse:**${verseReference}**\n\n✍️ **Your reflection:**\n${reflection}`
        );
      } catch (err) {
        console.error(err);
      }

      return interaction.reply({
        content: xpAwarded
          ? '🙏 Reflection saved in your DMs. **+20 XP**'
          : '🙏 Reflection saved in your DMs.',
        flags: 64
      });
    }

    /* ===================== SLASH COMMANDS ===================== */

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, interaction.client);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error executing this command.',
        flags: 64
      });
    }
  },
};