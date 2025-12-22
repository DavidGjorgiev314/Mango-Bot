const { SlashCommandBuilder } = require('discord.js');
const { getVerseOfTheDay } = require('../../events/autoverse');
const config = require("../../config.json");
const ownerID = config.ownerID;
const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testverse')
    .setDescription('Send the Bible Verse of the Day embed (testing only)'),

  async execute(interaction) {
    if (interaction.user.id !== ownerID) {
      return interaction.reply({ content: '❌ You are not allowed to use this command.', flags: 64 });
    }
    try {
      await interaction.deferReply();

    const read_button = new ButtonBuilder()
     .setCustomId('daily_embed_xp')
     .setLabel('Read')
     .setEmoji('📖')
     .setStyle(ButtonStyle.Success);

     const translate_button = new ButtonBuilder()
     .setCustomId('translate')
     .setLabel(`Translate`)
     .setEmoji('🇲🇰')
     .setStyle(ButtonStyle.Primary);

     const row = new ActionRowBuilder().addComponents(
     read_button,
     translate_button
     );

      const counter = 'TEST';

      const embed = await getVerseOfTheDay(counter);

      if (!embed) {
        return interaction.editReply('❌ Failed to fetch verse.');
      }

      await interaction.editReply({
      embeds: [embed],
      components: [row],
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Error sending test verse.');
    }
  },
  guildOnly: ['1308962670740897928'],
};
