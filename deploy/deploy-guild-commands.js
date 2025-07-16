const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

async function deployCommandsToGuilds(guildIds, client = null) {
	const rest = new REST({ version: '10' }).setToken(token);
	const foldersPath = path.join(__dirname, '../commands');
	const commandFolders = fs.readdirSync(foldersPath);

	const output = [];

	for (const guildId of guildIds) {
		const guildCommands = [];

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				if (file === 'ping.js') continue;
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);

				if ('data' in command && 'execute' in command) {
					// Include only if:
					// - there's no guildOnly restriction
					// - or this guildId is explicitly allowed
					if (!command.guildOnly || command.guildOnly.includes(guildId)) {
						guildCommands.push(command.data.toJSON());
					}
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}

		try {
			let guildName = guildId;
			if (client) {
				let guild = client.guilds.cache.get(guildId);
				if (!guild) guild = await client.guilds.fetch(guildId);
				if (guild) guildName = guild.name;
			}

			const data = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: guildCommands },
			);

			const msg = `✅ Reloaded ${data.length} commands for: ${guildName}`;
			console.log(msg);
			output.push(msg);
		} catch (error) {
			const errMsg = `❌ Failed to deploy for: ${guildId}: ${error}`;
			console.error(errMsg);
			output.push(errMsg);
		}
	}

	return output;
}


module.exports = { deployCommandsToGuilds };