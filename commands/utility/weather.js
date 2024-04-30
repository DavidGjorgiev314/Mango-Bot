const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get the weather forecast for your location!")
    .addStringOption(option => {
      return option
      .setName("location")
      .setDescription("Enter the location for the weather forecast")
      .setRequired(true)
    }),
	async execute(interaction) {
        const { options } = interaction;
		const location = options.getString('location');
    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=757fe46a28c9b169e2b8fdd5e2564e45&units=metric`);
      const weatherData = response.data;
      const weatherEmbed = new EmbedBuilder()
                .setTitle(`Weather forecast for ${weatherData.name}`)
                .setDescription(`Current weather: ${weatherData.weather[0].description}`)
      			.addFields(
					{ name: `Temperature`, value: `:thermometer: ${weatherData.main.temp}°C`, inline: true },
					{ name: 'Feels Like', value: `:nerd: ${weatherData.main.feels_like}°C`, inline: true },
                    { name: "\t", value: "\t" },
                    { name: 'Sunrise', value: `:sunrise: <t:${weatherData.sys.sunrise}:t>`, inline: true },
                    { name: 'Sunset', value: `:sunset: <t:${weatherData.sys.sunset}:t>`, inline: true },
                    { name: "\t", value: "\t" },
                    { name: 'Humidity', value: `:sweat_drops: ${weatherData.main.humidity}%`, inline: true },
                    { name: 'Wind Speed', value: `:dash: ${Math.round((weatherData.wind.speed*3.6)*100)/100}km/h`, inline: true },
                )
      			.setThumbnail(`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`)
                .setColor('#0099ff')
                .setFooter({ text: 'OpenWeatherMap', iconURL: 'https://openweathermap.org/themes/openweathermap/assets/img/mobile_app/android-app-top-banner.png' })
                .setTimestamp()
            await interaction.reply({ embeds: [weatherEmbed] });
        } catch (error) {
            console.error('Error fetching weather:', error);
            await interaction.reply('Sorry, an error occurred while fetching the weather.');
        }
	},
};