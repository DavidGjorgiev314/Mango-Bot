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
      return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
    }

    const member = interaction.options.getMember('user');
    const displayName = member.nickname || member.user.username;
    const dateStr = interaction.options.getString('date');

    if (!birthdaysStore.getBirthdayChannel(interaction.guild.id)) {
        await interaction.reply({
            content: '✅ Birthday set! ⚠️ Note: no birthday channel is configured yet. Use /set-birthday-channel to set one so the bot can send messages.',
            ephemeral: true
        });
        } 
    birthdaysStore.setBirthday(interaction.guild.id, member.id, dateStr);
    return interaction.reply(`✅ Birthday for **${displayName}** has been set to **${dateStr}** 🎂`);
  },
};
