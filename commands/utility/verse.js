const { SlashCommandBuilder, Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = {
  category: 'utility',
	data: new SlashCommandBuilder()
		.setName('verse')
		.setDescription('Mango gives you a random Bible verse!'),
	async execute(interaction) {
        try {
            const response = await axios.get('https://labs.bible.org/api/?passage=random&type=json');
            const verse = response.data[0];
            await interaction.reply(`:book: \`${verse.bookname} ${verse.chapter}:${verse.verse}\` \n"${verse.text}"`);
          } catch (error) {
            console.error('Error fetching Bible verse:', error);
            await interaction.reply('Could not fetch a Bible verse at this time.');
          }
	},
};