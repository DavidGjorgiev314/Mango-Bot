const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { canExecuteCommand } = require('../../rate-limiter');

const OWNER_ID = '312920065093664780';
const OWNER_GUILD_ID = '602663660288213013';
const channelsFilePath = path.join(__dirname, '../../votd-channels.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('unsubscribe')
		.setDescription('Unsubscribe this channel from the daily Bible verse feature.'),
	async execute(interaction) {
		if (interaction.guildId === OWNER_GUILD_ID && interaction.user.id !== OWNER_ID) {
			return await interaction.reply({
				content: `:no_entry: You cannot unsubscribe from this feature in **David's** server`,
				flags: 64
			});
		}

		if (!canExecuteCommand(interaction.user.id, 'unsubscribe', OWNER_ID)) {
			return await interaction.reply(`:hourglass: You can only use this command once every hour.`);
		}

		const channelId = interaction.channelId.toString();

		let channelData;
		try {
			const fileContent = fs.readFileSync(channelsFilePath, 'utf8');
			channelData = JSON.parse(fileContent);
		} catch {
			channelData = { channelIds: [] };
		}

		channelData.channelIds = channelData.channelIds.map(id => id.toString());

		if (channelData.channelIds.includes(channelId)) {
			channelData.channelIds = channelData.channelIds.filter(id => id !== channelId);
			try {
				fs.writeFileSync(channelsFilePath, JSON.stringify(channelData, null, 2));
				await interaction.reply(`:white_check_mark: Successfully unsubscribed channel from the daily Bible verse feature.`);
			} catch {
				await interaction.reply(`:x: Failed to unsubscribe. Try again later.`);
			}
		} else {
			await interaction.reply(`:information_source: This channel is not subscribed to the daily Bible verse feature.`);
		}
	},
};
