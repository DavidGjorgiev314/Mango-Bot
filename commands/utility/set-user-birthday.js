const { SlashCommandBuilder } = require('discord.js');
const birthdaysStore = require('../../events/birthdaysStore');

const config = require("../../config.json");
const ownerID = config.ownerID; 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-user-birthday')
    .setDescription('Owner only: set a birthday for another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to set a birthday for')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('date')
        .setDescription('The birthday (DD-MM-YYYY)')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== ownerID) {
      return interaction.reply({ content: '❌ You are not allowed to use this command.', flags: 64 });
    }

    const member = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const displayName = member?.nickname || user?.username || 'that user';
    const dateStr = interaction.options.getString('date');
    const hasChannel = Boolean(birthdaysStore.getBirthdayChannel(interaction.guild.id));

    try {
      birthdaysStore.setBirthday(interaction.guild.id, user.id, dateStr);
    } catch (err) {
      return interaction.reply({ content: `❌ ${err.message}`, flags: 64 });
    }

    if (!hasChannel) {
      return interaction.reply({
        content:
          `✅ Birthday for **${displayName}** has been set to **${dateStr}** 🎂\n` +
          '⚠️ Note: no birthday channel is configured yet. Use /set-birthday-channel so the bot can announce it.',
        flags: 64,
      });
    }

    return interaction.reply(`✅ Birthday for **${displayName}** has been set to **${dateStr}** 🎂`);
  },
};
