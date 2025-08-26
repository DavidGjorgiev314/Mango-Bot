const { SlashCommandBuilder } = require('discord.js');
const birthdaysStore = require('../../events/birthdaysStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-birthday-channel')
    .setDescription('Set the channel where birthday messages will be sent')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send birthday messages in')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Optional: only allow admins
    if (!interaction.member.permissions.has('MANAGE_GUILD')) {
      return interaction.reply({ content: '❌ You need Manage Server permission to set this.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');

    // Save channel in store
    birthdaysStore.setBirthdayChannel(interaction.guild.id, channel.id);

    return interaction.reply(`✅ Birthday messages will now be sent in ${channel}`);
  },
};