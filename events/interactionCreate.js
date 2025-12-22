const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const levelsFilePath = path.join(__dirname, '../data/levels.json');
const { loadCounter } = require('./ready');
const config = require("../config.json");
const ownerID = config.ownerID;
const axios = require('axios');
const cheerio = require('cheerio');

let levels = {};
if (fs.existsSync(levelsFilePath)) {
    levels = JSON.parse(fs.readFileSync(levelsFilePath));
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            const userId = interaction.user.id;

            if (!levels[userId]) {
                levels[userId] = {
                    xp: 0,
                    level: 1,
                    lastClick: 0,
                    totalXp: 0,
                    lastDailyClaim: null,
                    lastDailyClaimServer: null
                };
            }

            const userData = levels[userId];

            if (interaction.customId === 'daily_embed_xp') {
                const embedDate = new Date(interaction.message.createdTimestamp);
                const today = new Date();

                const isSameDay =
                    embedDate.getFullYear() === today.getFullYear() &&
                    embedDate.getMonth() === today.getMonth() &&
                    embedDate.getDate() === today.getDate();

                const now = new Date();
                const nextVerseTime = new Date(now);

                nextVerseTime.setHours(9, 0, 0, 0);
                if (now >= nextVerseTime) {
                    nextVerseTime.setDate(nextVerseTime.getDate() + 1);
                }

                const msLeft = nextVerseTime - now;
                const hours = Math.floor(msLeft / (1000 * 60 * 60));
                const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

                if (!isSameDay) {
                    return await interaction.reply({
                        content:
                            `⛔ This verse is from a previous day. You can only claim XP from today's verse.\n🕒 Next bible verse will be posted in **${hours}h ${minutes}m**.`,
                        flags: 64
                    });
                }

                const todayKey = today.toISOString().split("T")[0];

                if (userData.lastDailyClaim === todayKey) {
                    return await interaction.reply({
                        content:
                            `⛔ You already collected today's XP in **${userData.lastDailyClaimServer}**.\n🕒 Next bible verse will be posted in **${hours}h ${minutes}m**.`,
                        flags: 64
                    });
                }

                let reply;
                let xpGain = 50;

                const verseCount = loadCounter();

                if (verseCount % 10 === 0) {
                    xpGain = 100;
                    reply =
                        `✅ Bible verse read! **+${xpGain} XP** (Level ${userData.level})\n` +
                        `That's double XP than usual 👀\n` +
                        `📖 Don't forget to read your Bible too!`;
                } else {
                    reply =
                        `✅ Bible verse read! +${xpGain} XP (Level ${userData.level})\n` +
                        `📖 Don't forget to read your Bible too!`;
                }

                userData.xp += xpGain;
                userData.totalXp += xpGain;
                const xpNeeded = userData.level * 100;

                if (userData.xp >= xpNeeded) {
                    userData.level++;
                    userData.xp -= xpNeeded;
                    reply = `🚀 You leveled up to level ${userData.level}! (+${xpGain} XP)`;
                }
                userData.lastDailyClaim = todayKey;
                userData.lastDailyClaimServer = interaction.guild.name;

                const notifyUserId = ownerID;
                try {
                    const notifyUser = await interaction.client.users.fetch(notifyUserId);

                    await notifyUser.send(`📢 **${interaction.user.username}** just collected today's Bible verse in **${interaction.guild.name}**`);
                } catch (err) {
                    console.error("Failed to DM notify user:", err);
                }

                fs.writeFileSync(levelsFilePath, JSON.stringify(levels, null, 2));
                return await interaction.reply({ content: reply, flags: 64 });
            }

            if(interaction.customId === 'translate') {
                const url = 'https://www.bible.com/mk/verse-of-the-day';
                    const response = await axios.get(url);
                    const $ = cheerio.load(response.data);
                
                    const verseText = $('div[class*="border"] a').first().text().trim();
                    const verseReference = $('div[class*="border"] p').first().text().trim();

                    translation_reply = `📖 **${verseReference}**\n${verseText}`;
                    return await interaction.reply({ content: translation_reply, flags: 64 });
            }
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction, interaction.client);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    flags: 64
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: 64
                });
            }
        }
    },
};