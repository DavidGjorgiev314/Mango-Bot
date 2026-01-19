const { SlashCommandBuilder, ChannelType } = require('discord.js');
const config = require("../../config.json");
const ownerID = config.ownerID; 

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('tell')
		.setDescription('Send a message to a specific channel.')
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('The channel to send the message to')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		)
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('The message to send')
				.setRequired(true)
		),

	async execute(interaction) {
		if (interaction.user.id !== ownerID) {
			return interaction.reply({
				content: 'You are not authorized to use this command.',
				flags: 64,
			});
		}

		const messageContent = interaction.options.getString('message')?.trim();
		const targetChannel = interaction.options.getChannel('channel');

		if (!messageContent) {
			return interaction.reply({
				content: 'Message cannot be empty.',
				flags: 64,
			});
		}

		if (!targetChannel || !targetChannel.isTextBased()) {
			return interaction.reply({
				content: 'Invalid channel selected.',
				flags: 64,
			});
		}

		await targetChannel.send({ content: messageContent });

		await interaction.reply({
			content: `Message sent to ${targetChannel}!`,
			flags: 64,
		});
	},
};