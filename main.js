const { exec } = require('child_process');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');

const activityOptions = {
    name: 'your every move 👀',
    type: ActivityType.Watching,
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    presence: {
        activities: [activityOptions],
    },
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', () => {
    exec('node deploy-guild-commands.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error deploying commands: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(`Deploy output: ${stdout}`);
    });
});

// Global error handling
process.on('unhandledRejection', (reason) => {
    console.warn('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Store for updated voice channel data
const voiceChannelData = new Map();
const lastChannelStates = new Map(); // For tracking state changes

// Safe fetch function with retry logic
async function safeFetch(fn, retries = 3, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            console.warn(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt < retries) await new Promise(res => setTimeout(res, delay));
            else throw error; // Rethrow after max retries
        }
    }
}

// Function to periodically update voice channel data
async function updateVoiceChannelData() {
    for (const [guildId, guild] of client.guilds.cache) {
        await new Promise(res => setTimeout(res, 500)); // Throttle guild processing
        try {
            const channels = await safeFetch(() => guild.channels.fetch());
            const voiceChannels = channels.filter(channel => channel.type === 2); // Voice channels only

            const updatedData = {};
            for (const [channelId, channel] of voiceChannels) {
                const fetchedChannel = await safeFetch(() => channel.fetch());
                const members = fetchedChannel.members.map(member => ({
                    tag: member.user.tag,
                    mute: member.voice.selfMute,
                    deaf: member.voice.selfDeaf,
                    video: member.voice.selfVideo,
                }));

                // Check if the channel state has changed
                const lastState = lastChannelStates.get(channelId);
                const currentState = {
                    name: channel.name,
                    members: members.map(m => `${m.tag}-${m.mute}-${m.deaf}-${m.video}`).join(','), // Unique string representation
                };

                if (!lastState || JSON.stringify(lastState) !== JSON.stringify(currentState)) {
                    // State has changed, update the cache
                    lastChannelStates.set(channelId, currentState);

                    // Add the updated channel data to the updatedData object
                    updatedData[channelId] = {
                        name: channel.name,
                        members,
                    };
                }
            }

            // Only update the voiceChannelData if there are changes
            if (Object.keys(updatedData).length > 0) {
                voiceChannelData.set(guildId, updatedData);
            }
        } catch (error) {
            console.error(`Error updating data for guild ${guildId}:`, error);
        }
    }
}

// Periodically update voice channel data every 30 seconds
setInterval(updateVoiceChannelData, 30000);

// Cleanup stale channel states every 10 minutes
setInterval(() => {
    const activeChannelIds = new Set();
    client.guilds.cache.forEach(guild => {
        guild.channels.cache.forEach(channel => {
            if (channel.type === 2) activeChannelIds.add(channel.id);
        });
    });

    // Remove stale states
    for (const channelId of lastChannelStates.keys()) {
        if (!activeChannelIds.has(channelId)) {
            lastChannelStates.delete(channelId);
        }
    }
}, 600000); // Cleanup every 10 minutes

// Make the voiceChannelData accessible to commands
client.voiceChannelData = voiceChannelData;

client.login(token);
