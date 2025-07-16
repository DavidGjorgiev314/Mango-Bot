const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { clientId, token } = require('../config.json');

const deployGuildCommands = async (guildId, client = null) => {
    const commands = [];
    const foldersPath = path.join(__dirname, '../commands');

    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            if (file === 'ping.js') continue;

            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                // Check for guildOnly filtering
                if (!command.guildOnly || command.guildOnly.includes(guildId)) {
                    commands.push(command.data.toJSON());
                }
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        let guildName = guildId;
        if (client) {
            let guild = client.guilds.cache.get(guildId);
            if (!guild) {
                guild = await client.guilds.fetch(guildId);
            }
            if (guild) guildName = guild.name;
        }

        console.log(`Deploying ${commands.length} command(s) to guild ${guildName}...`);

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`✅ Successfully deployed commands to guild ${guildName}`);
    } catch (error) {
        let guildName = guildId;
        if (client) {
            let guild = client.guilds.cache.get(guildId);
            if (!guild) {
                guild = await client.guilds.fetch(guildId);
            }
            if (guild) guildName = guild.name;
        }
        console.error(`❌ Error deploying commands to guild ${guildName}:`, error);
    }
};

module.exports = { deployGuildCommands };
