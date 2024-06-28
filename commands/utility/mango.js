const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('mango')
		.setDescription('Call Mango!'),
	async execute(interaction) {
		const mangoEmbed = new EmbedBuilder()
                .setTitle(`Meow..`)
                .setColor('#ffba66')
				.setImage('https://imgur.com/a/Trheylr')
            await interaction.reply({ embeds: [mangoEmbed] });
	},
};