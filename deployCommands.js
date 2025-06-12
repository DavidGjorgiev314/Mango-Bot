const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { clientId, token } = require('./config.json');

const deployGuildCommands = async (guildId) => {
    const commands = [];
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
                if (file === 'ping.js') continue;  // Skip ping.js
        
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(`Deploying commands to guild ${guildId}...`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log(`✅ Successfully deployed commands to guild ${guildId}`);
    } catch (error) {
        console.error(`❌ Error deploying commands to guild ${guildId}:`, error);
    }
};

module.exports = { deployGuildCommands };