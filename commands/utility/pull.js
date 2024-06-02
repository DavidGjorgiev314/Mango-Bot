const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require("axios");

const cards = 
      [
        {
            name:"Gyomei Himejima", 
            desc: "Stone Hashira", 
            power: 3000, 
            health: 2000, 
            speed: 1500, 
            type: "Combat", 
            source: "Card Pulls", 
            image: "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/8/86/Gyomei%27s_Nichirin_Weapon.png", 
            rank: "https://pngimg.com/uploads/letter_s/letter_s_PNG53.png"
        },
        {
            name:"Giyu Tomioka", 
            desc: "Water Hashira", 
            power: 2000, 
            health: 1000, 
            speed: 1000, 
            type: "Combat", 
            source: "Card Pulls", 
            image: "https://i.redd.it/i05okw0199571.jpg", 
            rank: "https://pngimg.com/uploads/letter_s/letter_s_PNG53.png"
        },
        {
            name:"Mitsuri Kanroji", 
            desc: "Love Hashira", 
            power: 1000, 
            health: 800, 
            speed: 500, 
            type: "Combat", 
            source: "Card Pulls", 
            image: "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/3/39/Mitsuri_appears_with_her_sword.png/", 
            rank: "https://pngimg.com/uploads/letter_s/letter_s_PNG53.png"
        },
  ]

module.exports = {
	data: new SlashCommandBuilder()
    .setName("pull")
    .setDescription("Pull a Demon Slayer card!"),
	async execute(interaction) {
    try {
        let pick = Math.floor(Math.random() * 2) + 1;
        const user = interaction.user;
      const cardEmbed = new EmbedBuilder()
                .setTitle(`**${cards[pick].name}**`)
                .setDescription(`${cards[pick].desc}\n\n**Power:** ${cards[pick].power}\n**Health:** ${cards[pick].health}\n**Speed:** ${cards[pick].speed}\n**Type:** ${cards[pick].type}\n**Source:** ${cards[pick].source}`)
      			.setThumbnail(`${cards[pick].rank}`)
                .setImage(`${cards[pick].image}`)
                .setColor('#0099ff')
                .setFooter({ text: `This card was pulled by ${user.username}`, iconURL: user.displayAvatarURL() })
            await interaction.reply({ embeds: [cardEmbed] });
        } catch (error) {
            console.error('Error', error);
            await interaction.reply('Sorry, an error occurred.');
        }
	},
};