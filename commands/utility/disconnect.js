const {
	SlashCommandBuilder,
} = require('discord.js');
const disconnectTimers = require('../../scripts/disconnectTimers');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnects you from a voice channel after a specified duration.')
		.addIntegerOption(option =>
			option.setName('duration')
				.setDescription('Time before disconnection (in chosen unit)')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('unit')
				.setDescription('Unit of time (minutes or hours)')
				.setRequired(true)
				.addChoices(
					{ name: 'minutes', value: 'minutes' },
					{ name: 'hours', value: 'hours' }
				)
		),
	async execute(interaction) {
		const member = interaction.member;
		const duration = interaction.options.getInteger('duration');
		const unit = interaction.options.getString('unit');

		if (!member.voice.channel) {
			return interaction.reply({
				content: 'You must be in a voice channel to use this command.',
				flags: 64
			});
		}

		const totalMinutes = unit === 'hours' ? duration * 60 : duration;

		if (totalMinutes < 1) {
			return interaction.reply({
				content: 'Duration must be at least 1 minute.',
				flags: 64
			});
		}
		if (totalMinutes > 1440) {
			return interaction.reply({
				content: 'The maximum allowed duration is 24 hours (1440 minutes).',
				flags: 64
			});
		}

		if (disconnectTimers.has(member.id)) {
			return interaction.reply({
				content: 'You already have a scheduled disconnect. Use /cancel-disconnect to cancel it first.',
				flags: 64
			});
		}

		await interaction.reply({
			content: `I will disconnect you in **${duration} ${unit}**.`,
			flags: 64
		});

		const timeout = setTimeout(async () => {
			disconnectTimers.delete(member.id);
			const refreshedMember = await interaction.guild.members.fetch(member.id);

			if (refreshedMember.voice.channel) {
				try {
					await refreshedMember.voice.disconnect();
					await interaction.followUp({
						content: `${refreshedMember.user.username} has been disconnected.`,
						flags: 64
					});
				} catch (err) {
					console.error(err);
					await interaction.followUp({
						content: `I couldn't disconnect you — do I have permission?`,
						flags: 64
					});
				}
			}
		}, totalMinutes * 60 * 1000);

		disconnectTimers.set(member.id, timeout);
	},
};
