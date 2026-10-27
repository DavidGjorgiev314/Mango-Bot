const { Events } = require('discord.js');
const votd = require('./handlers/votd');

async function respondWithError(interaction) {
  const payload = { content: 'There was an error executing this command.', flags: 64 };
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (err) {
    console.error('Failed to report interaction error:', err.message);
  }
}

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, interaction.client);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await respondWithError(interaction);
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error(`Autocomplete error for ${interaction.commandName}:`, error);
        }
      }
      return;
    }

    if (interaction.isAnySelectMenu()) {
      // No select menus are registered yet — nothing to route.
      return;
    }

    if (interaction.isButton()) {
      try {
        await votd.handleButton(interaction);
      } catch (error) {
        console.error('Button handler error:', error);
        await respondWithError(interaction);
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      try {
        await votd.handleModal(interaction);
      } catch (error) {
        console.error('Modal handler error:', error);
        await respondWithError(interaction);
      }
    }
  },
};
