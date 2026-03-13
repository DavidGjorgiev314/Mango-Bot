const fs = require('fs');
const path = require('path');
const { Events, TextChannel, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const cron = require('node-cron');
const { sendVerseOfTheDayToChannel } = require('./autoverse');
const { deployCommandsToGuilds } = require('../deploy/deploy-guild-commands');
const sendDailyFast = require('./sendDailyFast');
const lastMessageFile = path.join(__dirname, '../data/last-votd-message.json');

const counterFile = path.join(__dirname, '../data/verse-counter.json');

function loadCounter() {
  try {
    const data = fs.readFileSync(counterFile, 'utf8');
    const json = JSON.parse(data);
    return json.verseCount || 0;
  } catch (err) {
    console.error('Failed to read counter file. Defaulting to 0.');
    return 0;
  }
}

function saveCounter(count) {
  try {
    fs.writeFileSync(counterFile, JSON.stringify({ verseCount: count }, null, 2));
  } catch (err) {
    console.error('Failed to write counter file:', err);
  }
}

function loadLastMessages() {
  try {
    return JSON.parse(fs.readFileSync(lastMessageFile, 'utf8'));
  } catch {
    return {};
  }
}

async function disableTranslateButton(client, channelId) {
  console.log('--- disableTranslateButton START ---');
  console.log('Channel ID:', channelId);

  const data = loadLastMessages();
  console.log('Loaded JSON:', data);

  const messageId = data[channelId];
  console.log('Message ID from JSON:', messageId);

  if (!messageId) {
    console.warn('⚠️ No messageId found for channel');
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    console.log('✅ Channel fetched:', channel?.name);

    const message = await channel.messages.fetch(messageId);
    console.log('✅ Message fetched');

    if (!message.components.length) {
      console.warn('⚠️ Message has no components');
      return;
    }

    // Rebuild the ActionRow manually
    const row = message.components[0]; // raw MessageActionRow
    const updatedButtons = row.components.map(btn => {
      if (btn.type === 2) { // type 2 = Button
        const builder = new ButtonBuilder()
          .setCustomId(btn.customId)
          .setLabel(btn.label)
          .setStyle(btn.style)
          .setDisabled(
            btn.customId === 'translate' || btn.customId === 'daily_embed_xp'
          );
        if (btn.emoji) builder.setEmoji(btn.emoji);
        return builder;
      }
      return null; // ignore non-buttons
    }).filter(Boolean); // remove nulls

    const newRow = new ActionRowBuilder().addComponents(updatedButtons);

    await message.edit({ components: [newRow] });

    console.log('✅ Message edited successfully');
    console.log('--- disableTranslateButton END ---');

  } catch (error) {
    console.error('❌ ERROR inside disableTranslateButton');
    console.error(error);
  }
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const guildIds = client.guilds.cache.map(guild => guild.id);
    console.log('📦 Auto-deploying all guild (/) commands:');
    await deployCommandsToGuilds(guildIds, client);
    
    console.log(`Ready! Logged in as ${client.user.tag}`);

   cron.schedule('0 9 * * *', async () => {
    let count = loadCounter();
    count++;
    saveCounter(count);

    let dynamicChannelIds = [];
    try {
      const rawData = fs.readFileSync(path.join(__dirname, '../data/votd-channels.json'), 'utf8');
      const parsed = JSON.parse(rawData);
      dynamicChannelIds = parsed.channelIds || [];
    } catch (err) {
      console.error('Failed to read votd-channels.json:', err);
      return;
    }

    for (const channelId of dynamicChannelIds) {
      try {
        const channel = await client.channels.fetch(channelId);

        if (channel instanceof TextChannel) {
          await sendVerseOfTheDayToChannel(channel, count);
          console.log(`Scheduled Bible verse sent to ${channelId}.`);
        } else {
          console.error(`Channel ${channelId} is invalid or not a text channel.`);
        }
      } catch (error) {
        console.error(`Error sending verse to ${channelId}:`, error);
      }
    }
  },
  { timezone: 'Europe/Skopje' });
  cron.schedule(
    '0 0 * * *',
    async () => {
      const rawData = fs.readFileSync(
        path.join(__dirname, '../data/votd-channels.json'),
        'utf8'
      );
      const { channelIds = [] } = JSON.parse(rawData);

      for (const channelId of channelIds) {
        await disableTranslateButton(client, channelId);
      }
      await sendDailyFast(client); 
    },
    { timezone: 'Europe/Skopje' });
  },
  loadCounter
};