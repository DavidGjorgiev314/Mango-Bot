const { SlashCommandBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
    category: 'utility',
	data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Ask Mango for a joke")
    .addStringOption(option =>
        option
            .setName('category')
            .setDescription('Choose a category')
            .setRequired(true)
            .addChoices(
                { name: 'Any', value: 'Any' },
                { name: 'Misc', value: 'Misc' },
                { name: 'Programming', value: 'Programming' },
                { name: 'Dark', value: 'Dark' },
                { name: 'Pun', value: 'Pun' },
                { name: 'Spooky', value: 'Spooky' },
                { name: 'Christmas', value: 'Christmas' },
    )),
	async execute(interaction) {
    const category = interaction.options.getString('category');

    await interaction.deferReply();

    try {
      const response = await axios.get(`https://v2.jokeapi.dev/joke/${category}?blacklistFlags=religious`, {
        timeout: 15000,
      });
      const jokeData = response.data;

      if (jokeData.type === 'single') {
        await interaction.editReply(jokeData.joke);
      } else {
        await interaction.editReply(jokeData.setup);
        setTimeout(() => {
          interaction.editReply(`${jokeData.setup}\n${jokeData.delivery}`).catch(() => {});
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching joke:', error.message);
      await interaction.editReply('Sorry, I couldn\'t find a joke for you :(');
    }
	},
};
