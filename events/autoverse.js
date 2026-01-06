const axios = require('axios');
const cheerio = require('cheerio');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

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

async function sendVerseOfTheDayToChannel(channel, counter) {
  try {
    const embed = await getVerseOfTheDay(counter);

    if (!embed) {
      console.error('Failed to fetch or build the verse embed.');
      return;
    }

    const read_button = new ButtonBuilder()
     .setCustomId('daily_embed_xp')
     .setLabel('Read')
     .setEmoji('📖')
     .setStyle(ButtonStyle.Success);

     const translate_button = new ButtonBuilder()
     .setCustomId('translate')
     .setLabel(`Translate`)
     .setEmoji('🇲🇰')
     .setStyle(ButtonStyle.Secondary);

     const reflect_button = new ButtonBuilder()
     .setCustomId('reflect')
     .setLabel(`Reflect`)
     .setEmoji('✍️')
     .setStyle(ButtonStyle.Primary);

     const row = new ActionRowBuilder().addComponents(
     read_button,
     reflect_button,
     translate_button
     );
    console.log(`Verse of the Day embed #${counter} sent.`);
  } catch (error) {
    console.error('Error sending embed:', error.message);
  }
}

module.exports = {
  sendVerseOfTheDayToChannel,
  getVerseOfTheDay
};