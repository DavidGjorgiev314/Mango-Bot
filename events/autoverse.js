const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Function to get the Verse of the Day (VOTD)
async function getVerseOfTheDay() {
  try {
    const response = await axios.get('https://labs.bible.org/api/?passage=votd&type=json');
    return response.data; // Returns an array of verse objects
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

    let verseNumbers = [];
    let verseTexts = [];

    // Collect verse numbers and texts
    verses.forEach(verse => {
      verseNumbers.push(`${verse.chapter}:${verse.verse}`);
      verseTexts.push(verse.text.trim());
    });

    // Determine the verse range string
    let verseNumbersString;
    if (verseNumbers.length === 1) {
      verseNumbersString = verseNumbers[0];
    } else {
      const firstVerse = verseNumbers[0];
      const lastVerse = verseNumbers[verseNumbers.length - 1];
      const firstChapter = firstVerse.split(':')[0];
      const lastChapter = lastVerse.split(':')[0];
      if (firstChapter === lastChapter) {
        verseNumbersString = `${firstChapter}:${firstVerse.split(':')[1]}-${lastVerse.split(':')[1]}`;
      } else {
        verseNumbersString = `${firstVerse}-${lastVerse}`;
      }
    }

    // Join verse texts into a single string
    const verseText = verseTexts.join(' ').trim();

    // Construct the final message
    const message = `:cross: **Bible Verse of the Day** :cross:\n\n:book: ${verses[0].bookname} ${verseNumbersString}\n"${verseText}"`;

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
