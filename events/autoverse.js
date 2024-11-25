const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Function to get the Verse of the Day (VOTD) from bible.com
async function getVerseOfTheDay() {
  try {
    const url = 'https://www.bible.com/verse-of-the-day';
    const response = await axios.get(url);

    // Extract the JSON containing the verses from the response
    const match = response.data.match(/"verses":(\[\{.*?\}\])/);
    if (!match) {
      console.error('Unable to find verse data in the page.');
      return [];
    }

    // Parse the verses part and get the first verse's reference and content
    const verseData = JSON.parse(match[1]);
    const verse = verseData[0];

    // Extract the verse reference and content
    const verseReference = verse.reference.human;
    const verseText = verse.content;

    return [{ reference: verseReference, content: verseText }];
  } catch (error) {
    console.error('Error fetching Verse of the Day:', error.message);
    return [];
  }
}

// Function to send the Verse of the Day to a specified channel
async function sendVerseOfTheDayToChannel(channel) {
  try {
    const verses = await getVerseOfTheDay();
    if (verses.length === 0) {
      console.error('No verses found in the Verse of the Day response.');
      return;
    }

    const verse = verses[0];
    const verseReference = verse.reference;
    const verseText = verse.content.trim();

    // Construct the final message
    const message = `:cross: **Bible Verse of the Day** :cross:\n\n:book: \`${verseReference}\`\n"${verseText}"\n-# ✞ Read your Bible! Verse fetched from [Bible.com](<https://www.bible.com/verse-of-the-day>)`;
    await channel.send({ content: message });
    console.log('Verse of the Day sent:', message);
  } catch (error) {
    console.error('Error sending Verse of the Day:', error.message);
  }
}

module.exports = {
  sendVerseOfTheDayToChannel,
};
