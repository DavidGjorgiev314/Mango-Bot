const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsFilePath = path.join(__dirname, '../../levels.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Show the top 10 users by XP'),
	
	async execute(interaction) {
		if (!fs.existsSync(levelsFilePath)) {
			return interaction.reply({ content: '⚠️ Levels file not found.', ephemeral: true });
		}

		let levels;
		try {
			const rawData = fs.readFileSync(levelsFilePath, 'utf8');
			levels = JSON.parse(rawData);
		} catch (err) {
			console.error('Error reading levels.json:', err);
			return interaction.reply({ content: '❌ Failed to read levels data.', ephemeral: true });
		}

		const sorted = Object.entries(levels)
			.sort(([, a], [, b]) => b.xp - a.xp)
			.slice(0, 10);

		const leaderboard = await Promise.all(
			sorted.map(async ([userId, data], index) => {
				try {
					const member = await interaction.guild.members.fetch(userId);
					const name = member.displayName;
					return `**${index + 1}.** ${name} — Level ${data.level} (${data.xp} XP)`;
				} catch {
					return `**${index + 1}.** Unknown User (${userId}) — Level ${data.level} (${data.xp} XP)`;
				}
			})
		);

		return interaction.reply({
			content: `🏆 **Top 10 Devoted Bible Readers Leaderboard** ☦️\n\n${leaderboard.join('\n')}`
		});
	}
};