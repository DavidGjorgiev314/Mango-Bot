const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('listchannels')
        .setDescription('Lists all the voice and text channels in a specific server.')
        .addStringOption(option =>
            option
                .setName('server_id')
                .setDescription('The ID of the server to list channels from')
                .setRequired(true)
        ),
    async execute(interaction) {
            const userId = interaction.user.id;
            const authorizedUserId = '312920065093664780';
    
            if (userId !== authorizedUserId) {
                return interaction.reply('You do not have permission to execute this command.');
            }
        const serverId = interaction.options.getString('server_id');
        const guild = interaction.client.guilds.cache.get(serverId);

        if (!guild) {
            await interaction.reply(`Could not find a server with ID: ${serverId}`);
            return;
        }

        try {
            // Fetch all channels in the server
            const channels = await guild.channels.fetch();

            // Separate text and voice channels
            const textChannels = channels.filter(channel => channel.type === 0); // Type 0: Text channels
            const voiceChannels = channels.filter(channel => channel.type === 2); // Type 2: Voice channels

            let response = `**Server Name:** ${guild.name}\n**Server ID:** ${guild.id}\n\n`;

            // List text channels
            response += '**Text Channels:**\n';
            textChannels.forEach(channel => {
                response += `- ${channel.name} (ID: ${channel.id})\n`;
            });

            // List voice channels
            response += '\n**Voice Channels:**\n';
            for (const [channelId, channel] of voiceChannels) {
                const fetchedChannel = await channel.fetch();
                const members = fetchedChannel.members.map(member => {
                    const muteEmote = member.voice.selfMute ? ':microphone2: (Muted)' : '';
                    const deafenEmote = member.voice.selfDeaf ? ':mute: (Deafened)' : '';
                    const videoEmote = member.voice.selfVideo ? ':camera: (Camera ON)' : '';
                    return `    - ${member.user.tag}${muteEmote}${deafenEmote}${videoEmote}`;
                }).join('\n');

                response += `- ${channel.name}\n${members || '    No members currently in this channel.'}\n`;
            }

            await interaction.reply(response);
        } catch (error) {
            console.error(`Error fetching channels for server ID ${serverId}:`, error);
            await interaction.reply('There was an error fetching the channel information.');
        }
    },
};
