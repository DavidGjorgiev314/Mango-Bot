const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
    try {
      const { options } = interaction;
      let category = options.getString('category');
      const response = await axios.get(`https://v2.jokeapi.dev/joke/${category}?blacklistFlags=religious`);
      const jokeData = response.data;
      console.log(jokeData);
      if(jokeData.type == "single") {
        await interaction.reply(jokeData.joke);
      } else {
        await interaction.reply(jokeData.setup);
            setTimeout(() => {
                interaction.editReply(`${jokeData.setup}\n${jokeData.delivery}`);
            }, 3000);
      }
        } catch (error) {
            console.error('Error fetching joke:', error);
            await interaction.reply('Sorry, I coulndn\'t find a joke for you :(');
        }
	},
};