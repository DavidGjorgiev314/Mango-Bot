const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsFilePath = path.join(__dirname, '../../data/levels.json');
const localLevelsPath = path.join(__dirname, '../../data/localLevels.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Show the XP leaderboard')
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('Choose leaderboard type')
				.setRequired(true)
				.addChoices(
					{ name: 'Global', value: 'global' },
					{ name: 'Local (This Server)', value: 'local' }
				)
		),

	async execute(interaction) {

		const type = interaction.options.getString('type');

		let dataSource;
		let title;

		/* ================= GLOBAL ================= */

		if (type === 'global') {

			if (!fs.existsSync(levelsFilePath)) {
				return interaction.reply({ content: '⚠️ Levels file not found.', flags: 64 });
			}

			try {
				dataSource = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
			} catch (err) {
				console.error(err);
				return interaction.reply({ content: '❌ Failed to read levels data.', flags: 64 });
			}

			title = `🏆 **Top 10 Devoted Bible Readers Leaderboard (Global)** ☦️`;
		}

		/* ================= LOCAL ================= */

		if (type === 'local') {

			if (!fs.existsSync(localLevelsPath)) {
				return interaction.reply({ content: '❌ Local leaderboard not found.', flags: 64 });
			}

			let localLevels;

			try {
				localLevels = JSON.parse(fs.readFileSync(localLevelsPath, 'utf8'));
			} catch (err) {
				console.error(err);
				return interaction.reply({ content: '❌ Failed to read local leaderboard data.', flags: 64 });
			}

			const guildId = interaction.guild.id;

			if (!localLevels[guildId] || !localLevels[guildId].enabled) {
				return interaction.reply({
					content: '❌ Local leaderboard is not enabled in this server.',
					flags: 64
				});
			}

			dataSource = localLevels[guildId].users || {};
			title = `🏆 **${interaction.guild.name} Local Devoted Bible Readers Leaderboard** ☦️`;
		}

		/* ================= SORT ================= */

		const sorted = Object.entries(dataSource)
			.sort(([, a], [, b]) => {
				if (b.level === a.level) {
					return (b.totalXp || 0) - (a.totalXp || 0);
				}
				return b.level - a.level;
			})
			.slice(0, 10);

		if (sorted.length === 0) {
			return interaction.reply({
				content: 'No one has gained XP yet.',
				flags: 64
			});
		}

		/* ================= FORMAT ================= */

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

					if (index === 0)
						return `**${index + 1}.🏆 ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)**`;

					if (index === 1)
						return `**${index + 1}.**🥈 ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)`;

					if (index === 2)
						return `**${index + 1}.**🥉 ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)`;

					return `**${index + 1}.** ${displayName} — Level ${data.level} (${data.totalXp || 0} XP)`;

				} catch {
					return `**${index + 1}.** Unknown User (${userId}) — Level ${data.level} (${data.totalXp || 0} XP)`;
				}
			})
		);

		return interaction.reply({
			content: `${title}\n\n${leaderboard.join('\n')}`
		});
	}
};