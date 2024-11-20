const { SlashCommandBuilder, Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription('Lists all servers the bot is in.'),
	async execute(interaction) {
		const guilds = interaction.client.guilds.cache;
		const serverList = guilds.map((guild, index) => `${index + 1}. ${guild.name}`).join('\n');
		const totalCount = guilds.size;
		await interaction.reply(
			`I am in a total of **${totalCount}** server(s):\n\n${serverList}`;
	},
};
