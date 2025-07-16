const fs = require('fs');
const path = require('path');
const { Events, TextChannel } = require('discord.js');
const cron = require('node-cron');
const { sendVerseOfTheDayToChannel } = require('./autoverse');
const { deployCommandsToGuilds } = require('../deploy-guild-commands');

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

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const guildIds = client.guilds.cache.map(guild => guild.id);
    console.log('📦 Auto-deploying all guild (/) commands:');
    await deployCommandsToGuilds(guildIds, client);
    
    console.log(`Ready! Logged in as ${client.user.tag}`);

   cron.schedule('0 13 * * *', async () => {
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
  });
  },
};
