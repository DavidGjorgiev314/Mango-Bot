const { SlashCommandBuilder } = require('discord.js');
const birthdaysStore = require('../../events/birthdaysStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-birthday')
    .setDescription('Set your personal birthday (DD-MM-YYYY)')
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Your birthday (DD-MM-YYYY)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const dateStr = interaction.options.getString('date');
    const hasChannel = Boolean(birthdaysStore.getBirthdayChannel(interaction.guild.id));

    try {
      birthdaysStore.setBirthday(interaction.guild.id, interaction.user.id, dateStr);
    } catch (err) {
      return interaction.reply({ content: `❌ ${err.message}`, flags: 64 });
    }

    if (!hasChannel) {
      return interaction.reply({
        content:
          `✅ Your birthday has been set to **${dateStr}** 🎉\n` +
          '⚠️ Note: no birthday channel is configured yet. Use /set-birthday-channel so the bot can announce it.',
        flags: 64,
      });
    }

    return interaction.reply(`✅ Your birthday has been set to **${dateStr}** 🎉`);
  },
};
