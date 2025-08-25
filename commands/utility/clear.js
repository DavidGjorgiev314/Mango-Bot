const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require("../../config.json");
const ownerID = config.ownerID; 

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears a number of messages from this channel')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

    async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: 'This command can only be used in a server.', flags: 64 });
    }

    if (interaction.user.id !== ownerID) {
      return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
    }

    if (!interaction.channel || !interaction.channel.isTextBased?.()) {
      return interaction.reply({ content: 'This command can only be used in text channels.', flags: 64 });
    }

    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'I need the Manage Messages permission to delete messages.', flags: 64 });
    }

    const amount = interaction.options.getInteger('amount');
    if (!amount || amount < 1 || amount > 100) {
      return interaction.reply({ content: 'Please provide a number between 1 and 100.', flags: 64 });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `🧹 Cleared ${deleted.size} messages.`, flags: 64 });
    } catch (error) {
      console.error('Error deleting messages:', error);
      await interaction.reply({ content: 'There was an error deleting messages. Check my permissions and try again.', flags: 64 });
    }
  },
};