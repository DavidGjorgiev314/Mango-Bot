const { SlashCommandBuilder, Client, Intents, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Initialize your Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const OPENAI_API_KEY = 'sk-proj-xKiZNuZHt8H2PmVsSYByT3BlbkFJIy3FSYrz2LBw6dC5W5Em';
const url = 'https://api.openai.com/v1/chat/completions';

function chunkResponse(responseText) {
  const chunks = [];
  while (responseText.length > 0) {
    chunks.push(responseText.substring(0, 2000));
    responseText = responseText.substring(2000);
  }
  return chunks;
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Mango anything!")
    .addStringOption(option => {
      return option
      .setName("prompt")
      .setDescription("Enter a prompt")
      .setRequired(true)
    }),
	async execute(interaction) {
        const { options } = interaction;
		const prompt = options.getString('prompt');
    try {

const requestData = {
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: `${prompt}` }],
  temperature: 0.7
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENAI_API_KEY}`
};

axios.post(url, requestData, { headers })
  .then(async response => {
    console.log(response.data);
    // Handle response data here
    const responseText = response.data.choices[0].message.content.trim();
  
      // Split response into chunks if it exceeds 2000 characters
      if (responseText.length <= 2000) {
        interaction.reply(responseText);
      } else {
        const chunks = splitMessage(responseText, { maxLength: 2000 });
        for (const chunk of chunks) {
          await interaction.reply(chunk);
        }
      }
  });
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply('An error occurred while processing your request.');
    }
	},
};