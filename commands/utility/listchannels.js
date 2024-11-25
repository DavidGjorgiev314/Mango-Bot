const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('listchannels')
        .setDescription('Lists all text and voice channels of a server, including details about users in voice channels.')
        .addStringOption(option =>
            option
                .setName('serverid')
                .setDescription('The ID of the server to list channels from')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const userId = interaction.user.id;
        const authorizedUserId = '312920065093664780';

        if (userId !== authorizedUserId) {
            return interaction.reply('You do not have permission to execute this command.');
        }

        const serverId = interaction.options.getString('serverid');
        const guild = client.guilds.cache.get(serverId);

        if (!guild) {
            return interaction.reply('I could not find a server with that ID. Please check the ID and try again.');
        }

        const voiceChannels = client.voiceChannelData.get(serverId);
        const textChannels = guild.channels.cache.filter(channel => channel.type === 0); // Type 0 = text channels

        if (!voiceChannels && textChannels.size === 0) {
            return interaction.reply('No channel data is available yet. Please try again in a few seconds.');
        }

        let response = `**Channels in ${guild.name}:**\n\n`;

        // List text channels
        if (textChannels.size > 0) {
            response += '**Text Channels:**\n';
            textChannels.forEach(channel => {
                response += `- ${channel.name}\n`;
            });
        } else {
            response += '**No Text Channels Found**\n';
        }

        // List voice channels
        if (voiceChannels) {
            response += '\n**Voice Channels:**\n';
            for (const channelId in voiceChannels) {
                const channel = voiceChannels[channelId];
                const members = channel.members.map(member => {
                    const statuses = [];
                    if (member.mute) statuses.push(':microphone2: (Muted)');
                    if (member.deaf) statuses.push(':mute: (Deafened)');
                    if (member.video) statuses.push(':camera: (Camera ON)');
                    return `  • ${member.tag} ${statuses.join(' ')}`;
                });

                response += `- ${channel.name}\n${members.length > 0 ? members.join('\n') : '  • No users connected'}\n\n`;
            }
        }

        await interaction.reply(response);
    },
};
