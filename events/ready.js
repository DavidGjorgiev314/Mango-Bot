const { Events, ActivityType, TextChannel } = require('discord.js');
const cron = require('node-cron');
const { sendVerseOfTheDayToChannel } = require('./autoverse');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Set bot activity
		client.user.setActivity({
			name: 'your every move 👀',
			type: ActivityType.WATCHING,
		});

		// Function to send a random Bible verse immediately upon login
		const sendVerseOnStartup = async () => {
			try {
				const channelId = '602663660288213013'; // Replace with your channel ID
				const channel = await client.channels.fetch(channelId);

				// Check if the channel is a TextChannel
				if (channel instanceof TextChannel) {
					await sendVerseOfTheDayToChannel(channel);
					console.log('Bible verse sent immediately after startup.');
				} else {
					console.error('Invalid channel or not a text channel.');
				}
			} catch (error) {
				console.error('Error sending Bible verse immediately after startup:', error);
			}
		};

		// Schedule sending a verse every 24 hours
		cron.schedule('0 0 * * *', async () => {
			try {
				const channelId = '602663660288213013'; // Replace with your channel ID
				const channel = await client.channels.fetch(channelId);

				// Check if the channel is a TextChannel
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

		// Execute sendVerseOnStartup immediately after bot is ready
		sendVerseOnStartup();
	},
};