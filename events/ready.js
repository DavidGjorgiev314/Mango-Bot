const fs = require('fs');
const path = require('path');
const { Events, ActivityType, TextChannel } = require('discord.js');
const cron = require('node-cron');
const { sendVerseOfTheDayToChannel } = require('./autoverse');
const { channelIds } = require('../votd-channels.json');

const counterFile = path.join(__dirname, '../verse-counter.json');

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
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    cron.schedule('34 12 * * *', async () => {
      let count = loadCounter();
      count++;
      saveCounter(count);

      for (const channelId of channelIds) {
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
