const { SlashCommandBuilder } = require('discord.js');
const disconnectTimers = require('../../scripts/disconnectTimers.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('cancel-disconnect')
		.setDescription('Cancels your scheduled voice disconnect.'),
	async execute(interaction) {
		const memberId = interaction.member.id;

		if (!disconnectTimers.has(memberId)) {
			return interaction.reply({
				content: 'You have no scheduled disconnect to cancel.',
				flags: 64
			});
		}

		clearTimeout(disconnectTimers.get(memberId));
		disconnectTimers.delete(memberId);

		await interaction.reply({
			content: 'Your scheduled disconnect has been canceled.',
			flags: 64
		});
	},
};
