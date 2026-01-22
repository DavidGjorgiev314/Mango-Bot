const { SlashCommandBuilder, Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require("../../config.json");
const ownerID = config.ownerID;

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription('Lists all servers the bot is in.'),
	async execute(interaction) {
        const userId = interaction.user.id;

		if (userId !== ownerID) {
			return interaction.reply('You do not have permission to execute this command.');
		}
		const guilds = interaction.client.guilds.cache;
		let serverList = '';
		let index = 1;

		guilds.forEach(guild => {
			serverList += `${index}) ${guild.name} (${guild.id})\n`;
			index++;
		});

		const totalCount = guilds.size;

		await interaction.reply(
			`I am in a total of **${totalCount}** server(s):\n\n${serverList}`
		);
	},
};
