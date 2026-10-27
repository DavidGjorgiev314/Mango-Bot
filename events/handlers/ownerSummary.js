const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const { paths, readJson, writeJson } = require('./store');
const { formatEU } = require('./time');

const MAX_FIELDS = 25;

async function updateOwnerSummary(client, levels, meta) {
  try {
    const summaryData = readJson(paths.ownerSummary, { messageId: null });

    const channel = await client.channels.fetch(config.summaryChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle('📖 Daily Bible Activity Summary')
      .setColor(0x8b5cf6)
      .setTimestamp();

    for (const [userId, data] of Object.entries(levels).slice(0, MAX_FIELDS)) {
      let displayName = 'Unknown User';
      try {
        const user = await client.users.fetch(userId);
        displayName = user.globalName || user.username;
      } catch {}

      const dot = userId === meta.lastActivityUser ? ' •' : '';
      embed.addFields({
        name: `👤 ${displayName}${dot}`,
        value:
          `📘 Read: **${formatEU(data.lastDailyClaim)}**\n` +
          `✍️ Reflected: **${formatEU(data.lastReflection)}**`,
        inline: false,
      });
    }

    if (summaryData.messageId) {
      try {
        const msg = await channel.messages.fetch(summaryData.messageId);
        await msg.edit({ embeds: [embed] });
        return;
      } catch {
        summaryData.messageId = null;
      }
    }

    const sent = await channel.send({ embeds: [embed] });
    summaryData.messageId = sent.id;
    writeJson(paths.ownerSummary, summaryData);
  } catch (err) {
    console.error('Failed to update owner summary:', err.message);
  }
}

module.exports = { updateOwnerSummary };
