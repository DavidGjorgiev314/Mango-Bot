const { SlashCommandBuilder } = require('discord.js');
const { deployCommandsToGuilds } = require('../../deploy/deploy-guild-commands');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('deploy')
		.setDescription('Deploys all slash commands to all guilds.'),
	async execute(interaction) {
		const userId = interaction.user.id;
		const authorizedUserId = '312920065093664780';

		if (userId !== authorizedUserId) {
			return interaction.reply({ content: '❌ You are not authorized to deploy commands.', flags: 64 });
		}

		await interaction.reply('🚀 Deploying commands...');

		const guildIds = interaction.client.guilds.cache.map(guild => guild.id);
		const resultLines = await deployCommandsToGuilds(guildIds, interaction.client);

		await interaction.followUp('📦 Deployment Result:\n```' + resultLines.join('\n').slice(-1900) + '```');
	}
};
