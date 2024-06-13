const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pomodoro")
        .setDescription("Set a pomodoro timer!")
        .addStringOption(option => 
            option
                .setName("minutes")
                .setDescription("Set duration of timer")
                .setRequired(true)
        ),
    async execute(interaction) {
        // Extract the number of minutes from the command input
        const minutes = parseInt(interaction.options.getString("minutes"));
        if (isNaN(minutes) || minutes <= 0) {
            await interaction.reply('Please enter a valid number of minutes.');
            return;
        }

        // Send initial confirmation message
        await interaction.reply(`Timer set for ${minutes} minutes.`);

        // Convert minutes to milliseconds
        const milliseconds = minutes * 60 * 1000;

        try {
            // Set a timer for when the bot should join the voice channel
            setTimeout(async () => {
                // Check if the user is still in the voice channel
                const voiceChannel = interaction.member.voice.channel;
                if (!voiceChannel) {
                    await interaction.followUp('You need to be in a voice channel to use this command.');
                    return;
                }

                // Join the voice channel
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                connection.on(VoiceConnectionStatus.Ready, () => {
                    console.log('The bot has connected to the channel!');

                    // Path to your audio file (adjust as necessary)
                    const alarmPath = path.join(__dirname, 'pomodoro_over.mp3');

                    // Create an audio player
                    const player = createAudioPlayer();

                    // Create an audio resource from the file
                    const resource = createAudioResource(alarmPath);

                    // Play the audio resource
                    player.play(resource);
                    connection.subscribe(player);

                    // Listen for when the audio player finishes playing
                    player.on('idle', () => {
                        console.log('Playback has finished.');
                        connection.destroy(); // Disconnect from the voice channel after playback
                    });

                    // Send a follow-up message when the timer ends
                    interaction.followUp(`Time's up! ${minutes} minutes have passed.`);
                });

            }, milliseconds);

        } catch (error) {
            console.error('Error processing command:', error);
            await interaction.reply('There was an error processing your command.');
        }
    },
};
