const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const levelsFilePath = path.join(__dirname, '../data/levels.json');

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
                    claimed: [],
                    totalXp: 0
                };
            }

            const userData = levels[userId];

            if (interaction.customId === 'daily_embed_xp') {
                const messageId = interaction.message.id;
                const embedDate = new Date(interaction.message.createdTimestamp);
                const today = new Date();
                const isSameDay =
                    embedDate.getFullYear() === today.getFullYear() &&
                    embedDate.getMonth() === today.getMonth() &&
                    embedDate.getDate() === today.getDate();

                if (!isSameDay) {
                    return await interaction.reply({
                        content: '⛔ This verse is from a previous day. You can only claim XP from today\'s verse.',
                        flags: 64
                    });
                }

                if (userData.claimed.includes(messageId)) {
                    return await interaction.reply({
                        content: '⛔ You already read this verse.',
                        flags: 64
                    });
                }

                const xpGain = 50;
                userData.xp += xpGain;
                userData.totalXp = (userData.totalXp || 0) + xpGain;
                userData.claimed.push(messageId);

                const xpNeeded = userData.level * 100;
                let reply = `✅ Good job reading your daily bible verse! You gained ${xpGain} XP! (Level ${userData.level})\nDon't forget to read your Bible too!`;

                if (userData.xp >= xpNeeded) {
                    userData.level++;
                    userData.xp -= xpNeeded;
                    reply = `🆙 You leveled up to level ${userData.level}! (+${xpGain} XP)`;
                }

                fs.writeFileSync(levelsFilePath, JSON.stringify(levels, null, 2));
                return await interaction.reply({ content: reply, flags: 64 });
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
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags:64 });
            }
        }
    },
};