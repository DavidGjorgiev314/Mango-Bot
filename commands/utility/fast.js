const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const subsPath = path.join(__dirname, '../../data/fastSubscribers.json');

function loadSubs() {
  if (!fs.existsSync(subsPath)) return [];
  return JSON.parse(fs.readFileSync(subsPath));
}

function saveSubs(data) {
  fs.writeFileSync(subsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fast')
    .setDescription('Subscribe or unsubscribe from daily fasting rule DMs'),

  async execute(interaction) {
    const userId = interaction.user.id;
    let subs = loadSubs();

    if (subs.includes(userId)) {
      subs = subs.filter(id => id !== userId);
      saveSubs(subs);
      return interaction.reply({ content: '❌ You unsubscribed from fasting DMs.', flags: 64 });
    }

    subs.push(userId);
    saveSubs(subs);
    return interaction.reply({ content: '✅ You subscribed to daily fasting DMs.', flags: 64 });
  }
};