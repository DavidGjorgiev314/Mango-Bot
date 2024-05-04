const { SlashCommandBuilder, Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loto')
		.setDescription('Mango gives you 7 winning loto numbers!'),
	async execute(interaction) {
        let picked_numbers = [];
        for(let i=0; i<7; i++) {
          let number = Math.floor(Math.random() * 33) + 1;
          if(!picked_numbers.includes(number)) {
            picked_numbers.push(number);
          }
          else {
            i--;
          }
        }
        let response = picked_numbers.toString().replace(/,/g, ', ');
		await interaction.reply(`Here are your 7 winning loto numbers!\n :four_leaf_clover: ${response} :four_leaf_clover:`);
	},
};