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

const OPENAI_API_KEY = 'sk-proj-UBoKmvFJveeFAfwshXhGT3BlbkFJUwpRCxvPgzMvHrEGSQZh';
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
    
        // Acknowledge the interaction immediately
        await interaction.deferReply();
    
        // Make the API request
        const response = await axios.post(url, requestData, { headers });
        const responseText = response.data.choices[0].message.content.trim();
    
        // Split response into chunks if it exceeds 2000 characters
        if (responseText.length <= 2000) {
          await interaction.editReply(responseText);
        } else {
          const chunks = chunkResponse(responseText);
          for (const chunk of chunks) {
            await interaction.followUp(chunk);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        await interaction.reply('Mango has run out of ChatGPT requests. Pay to get more :PepeBusiness:');
      }
    },
};