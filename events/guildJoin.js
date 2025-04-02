const config = require("../config.json");

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild) {
        const welcomeMessage = `Hello **${guild.name}**!\nThanks for adding me! 😸`; 
        
        if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.members.me).has('SEND_MESSAGES')) {
            guild.systemChannel.send(welcomeMessage).catch(console.error);
        } else {
            const firstChannel = guild.channels.cache
                .filter(channel => channel.isTextBased() && channel.permissionsFor(guild.members.me).has('SEND_MESSAGES'))
                .first();

            if (firstChannel) firstChannel.send(welcomeMessage).catch(console.error);
        }

        console.log(`Joined a new guild: ${guild.name} (ID: ${guild.id})`);

        const ownerId = config.ownerID; 
        if (!ownerId) return console.error("Owner ID not found in config.json");

        try {
            const owner = await guild.client.users.fetch(ownerId);
            if (owner) {
                const serverIcon = guild.iconURL({ dynamic: true, size: 1024 }) || "https://cdn.discordapp.com/embed/avatars/0.png";

                await owner.send({
                    embeds: [{
                        title: "✅ Bot Added to a New Server!",
                        color: 0x00FF00,
                        thumbnail: { url: serverIcon },
                        fields: [
                            { name: "📌 Server Name", value: guild.name, inline: true },
                            { name: "🆔 Server ID", value: guild.id, inline: true },
                            { name: "👥 Total Members", value: `${guild.memberCount}`, inline: true }
                        ],
                        footer: { text: `Bot added on ${new Date().toLocaleString()}` }
                    }]
                });
            }
        } catch (error) {
            console.error("Could not send DM to owner:", error);
        }
    }
};
