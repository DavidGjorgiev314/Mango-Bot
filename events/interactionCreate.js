const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const levelsFilePath = path.join(__dirname, '../levels.json');

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
                    claimed: []
                };
            }

            const userData = levels[userId];

            if (interaction.customId === 'daily_embed_xp') {
                const messageId = interaction.message.id;

                if (userData.claimed.includes(messageId)) {
                    return await interaction.reply({
                        content: '⛔ You already read this verse.',
                        flags: 64
                    });
                }

                const xpGain = Math.floor(Math.random() * 10) + 15;
                userData.xp += xpGain;
                userData.claimed.push(messageId);

                const xpNeeded = userData.level * 100;
                let reply = `✅ Good job reading your daily bible verse! You gained ${xpGain} XP! (Level ${userData.level})`;

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
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};