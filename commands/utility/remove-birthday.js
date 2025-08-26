const { SlashCommandBuilder } = require('discord.js');
const birthdaysStore = require('../../events/birthdaysStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-birthday')
    .setDescription('Remove your birthday from the bot'),

  async execute(interaction) {
    const success = birthdaysStore.removeBirthday(interaction.guild.id, interaction.user.id);

    if (success) {
      return interaction.reply({ content: '✅ Your birthday has been removed.', ephemeral: true });
    } else {
      return interaction.reply({ content: '❌ You don\'t have a birthday set.', ephemeral: true });
    }
  },
};