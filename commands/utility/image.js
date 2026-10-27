const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Search for an image on the Internet!')
    .addStringOption(option => {
      return option
        .setName('keyword')
        .setDescription('Enter the keyword for the image')
        .setRequired(true);
    }),
  async execute(interaction) {
    const keyword = interaction.options.getString('keyword');

    await interaction.deferReply();

    try {
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          query: keyword,
          client_id: config.unsplashAccessKey,
        },
        timeout: 15000,
      });
      const imageData = response.data;

      const imageDescription = imageData.description;
      const imageAltDesc = imageData.alt_description;

      const inputTimestamp = new Date(imageData.created_at);
      const outputTimestamp = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(inputTimestamp);

      const imageEmbed = new EmbedBuilder()
        .setColor(imageData.color || '#0099ff')
        .setImage(imageData.urls.full)
        .setFooter({
          text: `by ${imageData.user.name} | ${outputTimestamp}`,
          iconURL: imageData.user.profile_image.large,
        });

      if (imageDescription) {
        imageEmbed.setTitle(imageDescription);
        if (imageAltDesc) imageEmbed.setDescription(imageAltDesc);
      } else if (imageAltDesc) {
        imageEmbed.setTitle(imageAltDesc);
      }

      await interaction.editReply({ embeds: [imageEmbed] });
    } catch (error) {
      console.error('Error fetching image:', error.message);
      await interaction.editReply(`Sorry, I couldn't find any images for \`${keyword}\` :confused:`);
    }
  },
};
