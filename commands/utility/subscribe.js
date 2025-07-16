const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { canExecuteCommand } = require('../../scripts/rate-limiter.js');

const OWNER_ID = '312920065093664780';
const channelsFilePath = path.join(__dirname, '../../data/votd-channels.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('subscribe')
		.setDescription('Subscribe this channel to the Bible Verse of the Day feature!'),
	async execute(interaction) {
		if (!canExecuteCommand(interaction.user.id, 'subscribe', OWNER_ID)) {
			return await interaction.reply(':hourglass: You can only use this command once every hour.');
		}

		const channelId = interaction.channelId;

		let channelData;
		try {
			const fileContent = fs.readFileSync(channelsFilePath, 'utf8');
			channelData = JSON.parse(fileContent);
		} catch {
			channelData = { channelIds: [] };
		}

		if (!channelData.channelIds.includes(channelId)) {
			channelData.channelIds.push(channelId);
			try {
				fs.writeFileSync(channelsFilePath, JSON.stringify(channelData, null, 2));
				await interaction.reply(':white_check_mark: Successfully subscribed this channel for Bible Verse of the Day.');
			} catch {
				await interaction.reply(':x: Failed to subscribe. Try again later.');
			}
		} else {
			await interaction.reply(':information_source: This channel is already subscribed.');
		}
	},
};
