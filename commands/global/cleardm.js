const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('cleardm')
    .setDescription('Delete my messages from this DM')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of my messages to delete')
        .setMinValue(1)
    )
    .addBooleanOption(option =>
      option
        .setName('all')
        .setDescription('Delete all my messages in this DM')
    ),

  async execute(interaction) {
    /* ---------- DM ONLY ---------- */
    if (interaction.guild) {
      return interaction.reply({
        content: '❌ This command can only be used in DMs.',
        flags: 64
      });
    }

    const deleteAll = interaction.options.getBoolean('all');
    const amount = interaction.options.getInteger('amount');

    if (!deleteAll && !amount) {
      return interaction.reply({
        content: '❌ Provide either **amount** or **all:true**.',
        flags: 64
      });
    }

    await interaction.deferReply({ flags: 64 });

    let deletedCount = 0;
    let lastId;

    while (true) {
      const messages = await interaction.channel.messages.fetch({
        limit: 100,
        before: lastId
      });

      if (!messages.size) break;

      for (const msg of messages.values()) {
        /* Only delete BOT messages */
        if (msg.author.id === interaction.client.user.id) {
          await msg.delete().catch(() => {});
          deletedCount++;

          if (!deleteAll && deletedCount >= amount) {
            return interaction.editReply(
              `🧹 Deleted ${deletedCount} message${deletedCount === 1 ? '' : 's'}.`
            );
          }
        }
      }

      lastId = messages.last().id;
    }

    return interaction.editReply(
      deletedCount
        ? `🧹 Deleted ${deletedCount} message${deletedCount === 1 ? '' : 's'}.`
        : 'ℹ️ No messages to delete.'
    );
  }
};