const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { EmbedBuilder } = require('discord.js');

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

async function getVerseOfTheDay(counter) {
  try {
    const url = 'https://www.bible.com/verse-of-the-day';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const verseText = $('div[class*="border"] a').first().text().trim();
    const verseReference = $('div[class*="border"] p').first().text().trim();

    let imageUrl = $('img[src*="imageproxy.youversionapi.com"]').attr('src');
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = `https://www.bible.com${imageUrl}`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`:cross: Bible Verse of the Day (#${counter}) :cross:`)
      .setDescription(`📖 **${verseReference}**\n${verseText}`)
      .setColor('#00FFFF')
      .setFooter({
        text: 'Read your Bible! Verse fetched from Bible.com',
        iconURL: 'https://www.bible.com/favicon.ico',
      });

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

    return embed;
  } catch (error) {
    console.error('Error fetching or parsing the verse:', error.message);
    return null;
  }
}

async function sendVerseOfTheDayToChannel(channel) {
  try {
    let count = loadCounter();
    count++; // increment the counter
    const embed = await getVerseOfTheDay(count);

    if (!embed) {
      console.error('Failed to fetch or build the verse embed.');
      return;
    }

    await channel.send({ embeds: [embed] });
    saveCounter(count);
    console.log(`Verse of the Day embed #${count} sent successfully.`);
  } catch (error) {
    console.error('Error sending embed:', error.message);
  }
}

module.exports = {
  sendVerseOfTheDayToChannel,
};
