const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check Mango\'s ping!'),
	async execute(interaction) {
		await interaction.reply(`:ping_pong: Pong! ${interaction.client.ws.ping}ms`);
	},
};