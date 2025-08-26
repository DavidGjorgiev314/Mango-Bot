const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsFilePath = path.join(__dirname, '../../data/levels.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Check your current level, XP, and progress to the next level'),
	
	async execute(interaction) {
		const userId = interaction.user.id;

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

		if (!levels[userId]) {
			return interaction.reply({ content: '📭 You have no level or XP data yet.', flags: 64 });
		}

		const { level, xp } = levels[userId];
		const name = interaction.member?.displayName ?? interaction.user.username;

		const nextLevelXp = level * 100;
		const percent = Math.floor((xp / nextLevelXp) * 100);
		const totalBars = 15;
		const filledBars = Math.round((percent / 100) * totalBars);
		const progress_bar = "▰".repeat(filledBars) + "▱".repeat(totalBars - filledBars);

		return interaction.reply(
			`☦️ **${name}**, you are level **${level}** with **${xp}/${nextLevelXp} XP**! 🌟\n` +
			`📈 ${progress_bar} **${percent}%**`
		);
	}
};