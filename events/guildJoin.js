const config = require("../config.json");
const { deployGuildCommands } = require("../deploy/deployCommands.js");

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild) {
        await deployGuildCommands(guild.id);
        const welcomeMessage = `### Hi there! I'm Mango :smirk_cat:\nThank you for inviting me to your server!\n\n:cat2: I am **David's** irl pet and I decided to join Discord because I'm bored. Here's all the stuff I can do!\n\n:cross: Daily Bible Verse of the Day\n- If you /subscribe, I will send you a bible verse every day so that you're always in touch with the Word of God! You can also /unsubscribe if you change your mind :smile_cat:\n\n:white_sun_small_cloud: Weather Forecast\n- By typing /weather [location], I will send you a forecast of your entered location.\n\n:frame_photo: High-Quality Image Search\n- If you are looking for some beautiful HD photos just type /image [keyword] and I will send them to you.\n\n:performing_arts: Joke\n- Want to hear a joke? Type /joke [category] and see if you find me funny :joy_cat:\n\n:four_leaf_clover: Lottery Numbers Generator\n- Planning on buying a lottery ticket but don't know which numbers to pick? No worries, just type /loto and I'll tell you the winning numbers :smirk_cat:`; 
        
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
