const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
  category: 'utility',
	data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Search for an image on the Internet!")
    .addStringOption(option => {
      return option
      .setName("keyword")
      .setDescription("Enter the keyword for the image")
      .setRequired(true)
    }),
	async execute(interaction) {
        const { options } = interaction;
		const keyword = options.getString('keyword');
    try {
      const response = await axios.get(`https://api.unsplash.com/photos/random?query=${keyword}&client_id=HMi17sm4raXFFJnfys_OKDyOFjvqezO7wvNyIjiZI7g`);
      const imageData = response.data;
      let imageDescription = imageData.description;
      let imageAltDesc = imageData.alt_description;
      const inputTimestamp = new Date(imageData.created_at);
      const outputTimestamp = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(inputTimestamp);
      if(imageData.description === null) {
        const imageEmbed = new EmbedBuilder()
                .setTitle(`${imageAltDesc}`)
                .setColor(`${imageData.color}`)
                .setImage(imageData.urls.full)
                .setFooter({ text: `by ${imageData.user.name} | ${outputTimestamp}`, iconURL: `${imageData.user.profile_image.large}` })
            await interaction.reply({ embeds: [imageEmbed] });
      } else {
      console.log(imageData);
      const imageEmbed = new EmbedBuilder()
                .setTitle(`${imageDescription}`)
                .setDescription(`${imageAltDesc}`)
                .setColor(`${imageData.color}`)
                .setImage(imageData.urls.full)
                .setFooter({ text: `by ${imageData.user.name} | ${outputTimestamp}`, iconURL: `${imageData.user.profile_image.large}` })
            await interaction.reply({ embeds: [imageEmbed] });
      }
        } catch (error) {
            console.error('Error fetching image:', error);
            await interaction.reply(`Sorry, I couldn\'t find any images for ${keyword} :confused:`);
        }
	},
};