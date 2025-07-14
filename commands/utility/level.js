const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsFilePath = path.join(__dirname, '../../levels.json');

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
			return interaction.reply({ content: '📭 You have no level or XP data yet.' });
		}

		const { level, xp } = levels[userId];
		const name = interaction.member?.displayName ?? interaction.user.username;

		const nextLevelXp = (level + 1) * 100;
		const currentLevelXp = level * 100;
		const progress = xp - currentLevelXp;
		const needed = nextLevelXp - currentLevelXp;
		const percent = Math.floor((progress / needed) * 100);

		return interaction.reply(
			`☦️ **${name}**, you are level **${level}** with **${xp} XP**! 🌟\n` +
			`📈 Progress to next level: **${progress}/${needed} XP** (${percent}%)`
		);
	}
};