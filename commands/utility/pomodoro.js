const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

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
        console.log('Command received');

        const minutes = parseInt(interaction.options.getString("minutes"));
        // if (isNaN(minutes) || minutes <= 0) {
        //     console.log('Invalid number of minutes provided');
        //     await interaction.reply('Please enter a valid number of minutes.');
        //     return;
        // }

        const member = await interaction.guild.members.fetch(interaction.member.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            console.log('User not in a voice channel');
            await interaction.reply('You need to be in a voice channel to use this command.');
            return;
        }

        console.log(`Timer set for ${minutes} minutes`);
        await interaction.reply(`Timer set for ${minutes} minutes.`);

        const milliseconds = minutes * 60 * 1000;

        try {
            console.log(`Setting a timer for ${milliseconds} milliseconds`);

            setTimeout(async () => {
                console.log('Timer ended. Checking voice channel.');

                const updatedMember = await interaction.guild.members.fetch(interaction.member.id);
                const updatedVoiceChannel = updatedMember.voice.channel;

                if (!updatedVoiceChannel || updatedVoiceChannel.id !== voiceChannel.id) {
                    console.log('User not found in the voice channel.');
                    await interaction.followUp('You need to be in the same voice channel to use this command.');
                    return;
                }

                console.log('Joining voice channel');
                const connection = joinVoiceChannel({
                    channelId: updatedVoiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const timeout = setTimeout(() => {
                    console.log('Voice connection timed out');
                    connection.destroy();
                    interaction.followUp('Failed to connect to the voice channel in time.');
                }, 15000); // 15 seconds timeout

                connection.on(VoiceConnectionStatus.Ready, async () => {
                    clearTimeout(timeout);
                    console.log('The bot has connected to the channel!');

                    const player = createAudioPlayer();
                    let stream;
                    try {
                        console.log('Creating stream from YouTube URL');
                        stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });
                        console.log('Stream created successfully');
                    } catch (error) {
                        console.error('Error creating stream:', error);
                        await interaction.followUp('There was an error creating the stream.');
                        return;
                    }

                    const resource = createAudioResource(stream);
                    player.play(resource);
                    connection.subscribe(player);

                    player.on(AudioPlayerStatus.Playing, () => {
                        console.log('The audio player is now playing!');
                    });

                    player.on(AudioPlayerStatus.Idle, () => {
                        console.log('Playback has finished.');
                        connection.destroy();
                    });

                    player.on('error', error => {
                        console.error('Error playing audio:', error);
                        connection.destroy();
                    });

                    await interaction.followUp(`Time's up! ${minutes} minutes have passed.`);
                });

                connection.on('stateChange', (oldState, newState) => {
                    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
                });

                connection.on('error', error => {
                    console.error('Connection error:', error);
                });

            }, milliseconds);

        } catch (error) {
            console.error('Error processing command:', error);
            await interaction.reply('There was an error processing your command.');
        }
    },
};
