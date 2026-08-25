const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { progression } = require('../../data/churchHistoryContent');
const { readProgress, getUser, hasBadge } = require('../../data/churchHistoryStore');

const BADGES_DIR = path.join(__dirname, '../../assets/badges');

module.exports = {
  category: 'churchhistory',
  data: new SlashCommandBuilder()
    .setName('church-stats')
    .setDescription('View your Church History exam stats, or look up another user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user whose stats you want to view')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') ?? interaction.user;
    const userId = targetUser.id;
    const isSelf = userId === interaction.user.id;

    const progress = readProgress();
    const userData = getUser(progress, userId);

    const displayName =
      interaction.guild
        ? (interaction.guild.members.cache.get(userId)?.displayName ?? targetUser.displayName ?? targetUser.username)
        : (targetUser.globalName ?? targetUser.username);

    // Build an ordered list of all works in the progression.
    const allWorks = [];
    for (const item of progression) {
      for (const work of item.works) {
        allWorks.push({ item, work });
      }
    }

    const earnedBadges = allWorks.filter(({ work }) => hasBadge(userData, work.id));
    const badgeLines = earnedBadges.map(({ item, work }) => {
      const stats = userData.works[work.id];
      const best = stats?.bestScore ?? 0;
      const attempts = stats?.attempts ?? 0;
      return `🏅 **${item.name}** — ${work.title}\n   Best: **${best}/${work.questions.length}** · Attempts: **${attempts}**`;
    });

    const workLines = allWorks
      .filter(({ work }) => userData.works[work.id] && userData.works[work.id].attempts > 0)
      .map(({ item, work }) => {
        const stats = userData.works[work.id];
        const percent = work.questions.length > 0
          ? Math.round((stats.bestScore / work.questions.length) * 100)
          : 0;
        const badge = hasBadge(userData, work.id) ? ' 🏅' : '';
        return `**${item.name}** — ${work.title}${badge}\nBest: **${stats.bestScore}/${work.questions.length}** (${percent}%) · Attempts: **${stats.attempts}**`;
      });

    const totalWorks = allWorks.length;
    const completedWorks = earnedBadges.length;

    const embed = new EmbedBuilder()
      .setTitle(isSelf ? '⛪ Your Church History Progress' : `⛪ ${displayName}'s Church History Progress`)
      .setColor(0x8b5cf6)
      .setDescription(
        `**Badges earned:** ${completedWorks}/${totalWorks}\n` +
        `**Overall completion:** ${Math.round((completedWorks / (totalWorks || 1)) * 100)}%`
      )
      .setFooter({ text: 'Passing score for a badge: 70% or above' });

    if (earnedBadges.length > 0) {
      embed.addFields({
        name: '🏅 Earned Badges',
        value: badgeLines.join('\n\n'),
        inline: false,
      });
    } else {
      embed.addFields({
        name: '🏅 Earned Badges',
        value: isSelf ? 'None yet — take `/church-exam` to earn your first badge!' : 'None yet.',
        inline: false,
      });
    }

    if (workLines.length > 0) {
      embed.addFields({
        name: '📊 Exam Stats',
        value: workLines.join('\n\n'),
        inline: false,
      });
    }

    // Build badge image embeds, preferring a hosted URL and falling back to
    // the local PNG files in assets/badges/.
    const files = [];
    const badgeEmbeds = [];

    for (const { item, work } of earnedBadges) {
      if (work.badgeUrl) {
        badgeEmbeds.push(
          new EmbedBuilder()
            .setTitle(`🏅 ${item.name} — ${work.title}`)
            .setImage(work.badgeUrl)
        );
        continue;
      }

      const badgePath = path.join(BADGES_DIR, `${work.id}.png`);
      if (fs.existsSync(badgePath)) {
        const fileName = `${work.id}.png`;
        files.push(new AttachmentBuilder(badgePath, { name: fileName }));
        badgeEmbeds.push(
          new EmbedBuilder()
            .setTitle(`🏅 ${item.name} — ${work.title}`)
            .setImage(`attachment://${fileName}`)
        );
      }
    }

    return interaction.reply({
      embeds: [embed, ...badgeEmbeds],
      files,
      flags: 64,
    });
  },
};
