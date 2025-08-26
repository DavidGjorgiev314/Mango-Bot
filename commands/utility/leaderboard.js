const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsFilePath = path.join(__dirname, '../../data/levels.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Show the top 10 users by XP'),

	async execute(interaction) {
		if (!fs.existsSync(levelsFilePath)) {
			return interaction.reply({ content: '⚠️ Levels file not found.', flags: 64 });
		}

		let levels;
		try {
			const rawData = fs.readFileSync(levelsFilePath, 'utf8');
			levels = JSON.parse(rawData);
		} catch (err) {
			console.error('Error reading levels.json:', err);
			return interaction.reply({ content: '❌ Failed to read levels data.', flags: 64 });
		}

		const sorted = Object.entries(levels)
			.sort(([, a], [, b]) => {
				if (b.level === a.level) {
					return (b.totalXp || 0) - (a.totalXp || 0);
				}
				return b.level - a.level;
			})
			.slice(0, 10);

		const leaderboard = await Promise.all(
			sorted.map(async ([userId, data], index) => {
				try {
					let displayName;
					try {
						const member = await interaction.guild.members.fetch(userId);
						displayName = member.displayName;
					} catch {
						const user = await interaction.client.users.fetch(userId);
						displayName = user.globalName || user.username;
					}
					if(index == 0)
						return `**${index + 1}.🏆 ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)**`;
					if(index == 1)
						return `**${index + 1}.**🥈 ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)`;
					if(index == 2)
						return `**${index + 1}.**🥉 ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)`;
					else
						return `**${index + 1}.** ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)`;
				} catch {
					return `**${index + 1}.** Unknown User (${userId}) — Level ${data.level} (${data.totalXp || 0} XP)`;
				}
			})
		);

		return interaction.reply({
			content: `🏆 **Top 10 Devoted Bible Readers Leaderboard** ☦️\n\n${leaderboard.join('\n')}`
		});
	}
};