const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

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

client.once('ready', async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const guilds = client.guilds.cache.map(guild => guild.id);

		for (const guildId of guilds) {
			try {
				const data = await rest.put(
					Routes.applicationGuildCommands(clientId, guildId),
					{ body: commands },
				);
				console.log(`Successfully reloaded ${data.length} guild-specific application (/) commands for guild ${guildId}.`);
			} catch (error) {
				console.error(`Error registering commands for guild ${guildId}:`, error);
			}
		}

		console.log('Successfully reloaded all guild-specific application (/) commands.');
	} catch (error) {
		console.error('Error registering commands:', error);
	}
});

client.login(token);
