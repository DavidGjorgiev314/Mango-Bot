const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { clientId, token } = require('../config.json');

const deployGlobalCommands = async () => {
    const commands = [];
    const globalPath = path.join(__dirname, '../commands/global');

    if (!fs.existsSync(globalPath)) {
        console.log('ℹ️ No global commands directory found.');
        return;
    }

    const commandFiles = fs.readdirSync(globalPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(globalPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The global command at ${filePath} is missing "data" or "execute".`);
        }
    }

    if (commands.length === 0) {
        console.log('ℹ️ No global commands found to deploy.');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(`🌍 Deploying ${commands.length} global command(s)...`);

        await rest.put(
            Routes.applicationCommands(clientId), // global endpoint
            { body: commands }
        );

        console.log('✅ Successfully deployed global commands.');
    } catch (error) {
        console.error('❌ Error deploying global commands:', error);
    }
};

// Execute immediately if run via node
deployGlobalCommands();
