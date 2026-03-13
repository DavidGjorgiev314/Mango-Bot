const fs = require('fs');
const path = require('path');
const localLevelsPath = path.join(__dirname, '../../data/localLevels.json');

module.exports = {
  name: 'enable-local-leaderboard',
  description: 'Enable local leaderboard for this server',
  async execute(interaction) {

    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '⛔ Only administrators can enable this.',
        flags: 64
      });
    }

    let localLevels = {};
    if (fs.existsSync(localLevelsPath)) {
      localLevels = JSON.parse(fs.readFileSync(localLevelsPath));
    }

    const guildId = interaction.guild.id;

    if (!localLevels[guildId]) {
      localLevels[guildId] = {
        enabled: true,
        users: {}
      };
    } else {
      localLevels[guildId].enabled = true;
    }

    fs.writeFileSync(localLevelsPath, JSON.stringify(localLevels, null, 2));

    return interaction.reply({
      content: '🏆 Local leaderboard has been enabled for this server!',
      flags: 64
    });
  }
};