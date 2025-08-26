const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const birthdaysStore = require('../../events/birthdaysStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthdays')
    .setDescription('List the next 10 upcoming birthdays'),

  async execute(interaction) {
    const allBirthdays = birthdaysStore.getAllBirthdays(interaction.guild.id);
    const today = new Date();

    // Prepare array with user info and next birthday date
    const membersData = await Promise.all(
      Object.entries(allBirthdays).map(async ([userId, dateStr]) => {
        const [dd, mm, yyyy] = dateStr.split('-').map(Number);
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) return null;

        // Determine next birthday date
        let nextBirthday = new Date(today.getFullYear(), mm - 1, dd);
        if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);

        const nextAge = nextBirthday.getFullYear() - yyyy;
        const displayName = member.nickname || member.user.username;

        return { displayName, nextBirthday, nextAge, member };
      })
    );

    // Filter nulls and sort by next birthday date
    const upcoming = membersData.filter(Boolean).sort((a, b) => a.nextBirthday - b.nextBirthday).slice(0, 10);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Upcoming Birthdays')
      .setColor('#FFD700');

    if (upcoming.length === 0) {
      embed.setDescription('No upcoming birthdays found.');
    } else {
      // Group by date
      const lines = [];
      let lastDate = '';
      for (const b of upcoming) {
        const dateStr = b.nextBirthday.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        if (dateStr !== lastDate) {
          if (lines.length > 0) lines.push(''); // Add empty line between dates
          lines.push(dateStr);
          lastDate = dateStr;
        }
        lines.push(`<@${b.member.id}> (turns ${b.nextAge})`);
      }
      embed.setDescription(lines.join('\n'));
    }

    await interaction.reply({ embeds: [embed] });
  },
};
