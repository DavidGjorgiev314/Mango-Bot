const { Events, ActivityType, TextChannel } = require('discord.js');
const cron = require('node-cron');
const { sendVerseOfTheDayToChannel } = require('./autoverse');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		cron.schedule('0 12 * * *', async () => {
			try {
				const channelId = '602663660288213013';
				const channel = await client.channels.fetch(channelId);

				if (channel instanceof TextChannel) {
					await sendVerseOfTheDayToChannel(channel);
					console.log('Scheduled Bible verse sent.');
				} else {
					console.error('Invalid channel or not a text channel.');
				}
			} catch (error) {
				console.error('Error sending scheduled Bible verse:', error);
			}
		});
	},
};