const config = require("../config.json");

module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(guild) {
        console.log(`Left a guild: ${guild.name} (ID: ${guild.id})`);

        const ownerId = config.ownerID; 
        if (!ownerId) return console.error("Owner ID not found in config.json");

        try {
            const owner = await guild.client.users.fetch(ownerId);
            if (owner) {
                await owner.send({
                    embeds: [{
                        title: "❌ Bot Removed from a Server!",
                        color: 0xFF0000,
                        thumbnail: { url: guild.iconURL({ dynamic: true, size: 1024 }) || "https://cdn.discordapp.com/embed/avatars/0.png" },
                        fields: [
                            { name: "📌 Server Name", value: guild.name || "Unknown", inline: true },
                            { name: "🆔 Server ID", value: guild.id, inline: true },
                            { name: "👥 Previous Member Count", value: `${guild.memberCount || "Unknown"}`, inline: true }
                        ],
                        footer: { text: `Bot removed on ${new Date().toLocaleString()}` }
                    }]
                });
            }
        } catch (error) {
            console.error("Could not send DM to owner:", error);
        }
    }
};
