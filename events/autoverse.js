const axios = require('axios');
const cheerio = require('cheerio');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Function to get the Verse of the Day (VOTD) from bible.com
async function getVerseOfTheDay() {
  try {
    const url = 'https://www.bible.com/verse-of-the-day';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Selectors based on the HTML structure provided
    const verseText = $('div.mbs-3.border.border-l-large.rounded-1.border-black.dark\\:border-white.pli-1.plb-1.pis-2 > a.w-full.no-underline.dark\\:text-text-dark.text-text-light').first().text().trim();
    const verseReference = $('div.mbs-3.border.border-l-large.rounded-1.border-black.dark\\:border-white.pli-1.plb-1.pis-2 > a.w-full.no-underline > p').first().text().trim();

    // Remove the version part from the reference using a regular expression
    const cleanedReference = verseReference.replace(/\s*\(.*?\)$/, '');

    if (verseText && cleanedReference) {
      return [{ reference: cleanedReference, content: verseText }];
    } else {
      console.error('Unable to find the verse content or reference.');
      return [];
    }
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
    const verseReference = `${verse.reference}`;
    const verseText = verse.content.trim();

    // Construct the final message
    const message = `:cross: **Bible Verse of the Day** :cross:\n\n:book: ${verseReference}\n"${verseText}"`;

    // Send the message to the channel
    await channel.send({ content: message });
    console.log('Verse of the Day sent:', message);
  } catch (error) {
    console.error('Error sending Verse of the Day:', error.message);
  }
}

module.exports = {
  sendVerseOfTheDayToChannel,
};

// For testing purposes, let's fetch the verse of the day
getVerseOfTheDay().then(verses => {
  console.log('Fetched Verses:', verses);
});
