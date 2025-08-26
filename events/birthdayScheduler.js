const cron = require('node-cron');
const birthdaysStore = require('./birthdaysStore');

module.exports = (client) => {
  // Only run after client is ready
  client.once('ready', () => {
    console.log('Birthday scheduler active!');

    // Helper to get ordinal suffix
    function getOrdinal(n) {
      const j = n % 10,
            k = n % 100;
      if (j === 1 && k !== 11) return `${n}st`;
      if (j === 2 && k !== 12) return `${n}nd`;
      if (j === 3 && k !== 13) return `${n}rd`;
      return `${n}th`;
    }

    // Cron: run every day at 00:00
    cron.schedule('0 0 * * *', async () => {
      try {
        const allData = birthdaysStore.load();

        for (const guildId of Object.keys(allData)) {
          const channelId = birthdaysStore.getBirthdayChannel(guildId);
          if (!channelId) continue;

          const guild = await client.guilds.fetch(guildId).catch(() => null);
          if (!guild) continue;

          const channel = await client.channels.fetch(channelId).catch(() => null);
          if (!channel) continue;

          const birthdaysToday = birthdaysStore.getTodayBirthdays(guildId);
          if (birthdaysToday.length === 0) continue;

          for (const [userId, dateStr] of birthdaysToday) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) continue;

            const birthYear = parseInt(dateStr.split('-')[2], 10);
            const todayYear = new Date().getFullYear();
            const age = todayYear - birthYear;

            const ordinalAge = getOrdinal(age);

            await channel.send(`🎉 Happy ${ordinalAge} Birthday, <@${member.id}>! 🥳`);
          }

          console.log(`Birthday messages sent in guild ${guildId}`);
        }
      } catch (error) {
        console.error('Error sending birthday messages:', error);
      }
    });
  });
};
