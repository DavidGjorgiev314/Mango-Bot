const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const channelsFilePath = path.join(__dirname, '../../votd-channels.json');
const OWNER_ID = '312920065093664780';

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('list-subscriptions')
		.setDescription('List all channels subscribed to VOTD (owner only).'),
	async execute(interaction) {
		if (interaction.user.id !== OWNER_ID) {
			return await interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
		}

		let channelData;
		try {
			const fileContent = fs.readFileSync(channelsFilePath, 'utf8');
			channelData = JSON.parse(fileContent);
		} catch {
			channelData = { channelIds: [] };
		}

		if (channelData.channelIds.length === 0) {
			return await interaction.reply('📭 No channels are currently subscribed.');
		}

		const results = await Promise.all(
			channelData.channelIds.map(async id => {
				try {
					const channel = await interaction.client.channels.fetch(id);
					const guildName = channel.guild?.name ?? 'Unknown Server';
					return `📌 ${guildName} > #${channel.name} (${id})`;
				} catch {
					return `❓ Unknown Server > Unknown Channel (${id})`;
				}
			})
		);

		await interaction.reply(`📃 **Subscribed Channels:**\n${results.join('\n')}`);
	},
};
