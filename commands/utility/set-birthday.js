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

    // Validate
    if (!birthdaysStore.getBirthdayChannel(interaction.guild.id)) {
        await interaction.reply({
            content: '✅ Birthday set! ⚠️ Note: no birthday channel is configured yet. Use /set-birthday-channel to set one so the bot can send messages.',
            ephemeral: true
        });
      }
    birthdaysStore.setBirthday(interaction.guild.id, interaction.user.id, dateStr);
    return interaction.reply(`✅ Your birthday has been set to **${dateStr}** 🎉`);
  },
};
