const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
    category: 'utility',
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
        const API_key = "VLBLvY9Ga1aSGCb6zy4tbRgBF379BB6f";
        try {
            const city = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${API_key}&q=${location}`);
            const cityData = city.data;
            const cityKey = cityData[0].Key;
            const weather = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${cityKey}?apikey=${API_key}`);
            const weatherData = weather.data;
            const hourlyForecastResponse = await axios.get(`https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${cityKey}?apikey=${API_key}&metric=true`);
            const hourlyForecast = hourlyForecastResponse.data;

            let weathericon = ``;
            if (weatherData[0].WeatherIcon < 10)
                weathericon = `https://developer.accuweather.com/sites/default/files/0${weatherData[0].WeatherIcon}-s.png`;
            else
                weathericon = `https://developer.accuweather.com/sites/default/files/${weatherData[0].WeatherIcon}-s.png`;

            let flag = (cityData[0].Country.ID).toLowerCase();
            const weatherEmbed = new EmbedBuilder()
                .setTitle(`Weather forecast for:\n ${cityData[0].LocalizedName}, ${cityData[0].Country.LocalizedName} :flag_${flag}:`)
                .setDescription(`Current weather: **${weatherData[0].WeatherText}**`)
                .addFields(
                    { name: `Temperature Now`, value: `:thermometer: ${weatherData[0].Temperature.Metric.Value}°C`, inline: true }
                )
                .setThumbnail(`${weathericon}`)
                .setColor('#0099ff')
                .setFooter({ text: 'AccuWeather', iconURL: 'https://w7.pngwing.com/pngs/807/386/png-transparent-accuweather-weather-forecasting-the-weather-channel-app-store-weather-orange-weather-forecasting-platinum-thumbnail.png' })
                .setTimestamp();

            // Add 12-hour forecast to the embed
            hourlyForecast.forEach(hour => {
                const time = new Date(hour.DateTime).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                let emoji=``;
                // Converting WeatherIcon to a Discord emoji
                switch(hour.WeatherIcon) {
                    case 1:
                        emoji = `:sunny:`;
                        break;
                    case 2:
                    case 3:
                        emoji = `:white_sun_small_cloud:`;
                        break;
                    case 4:
                    case 5:
                        emoji = `:partly_sunny:`;
                        break;
                    case 6:
                        emoji = `:white_sun_cloud:`;
                        break;
                    case 7:
                    case 8:
                        emoji = `:cloud:`;
                        break;
                    case 11:
                        emoji = `:fog:`;
                        break;
                    case 12:
                    case 18:
                    case 25:
                    case 26:
                    case 29:
                    case 39:
                    case 40:
                        emoji = `:cloud_rain:`;
                        break;
                    case 13:
                    case 14:
                        emoji = `:white_sun_rain_cloud:`;
                        break;
                    case 15:
                    case 16:
                    case 17:
                    case 41:
                    case 42:
                        emoji = `:thunder_cloud_rain:`;
                        break;
                    case 19:
                    case 20:
                    case 21:
                    case 22:
                    case 23:
                        emoji = `:cloud_snow:`;
                        break;
                    case 24:
                        emoji = `:ice_cube:`;
                        break;
                    case 30:
                        emoji = `:hot_face:`;
                        break;
                    case 31:
                        emoji = `:cold_face:`;
                        break;
                    case 32:
                        emoji = `:wind_face:`;
                        break;
                    case 33:
                    case 34:
                    case 35:
                        emoji = `:full_moon:`;
                        break;
                    case 36:
                    case 37:
                    case 38:
                        emoji = `:cloud:`;
                        break;
                    case 43:
                    case 44:
                        emoji = `:cloud_snow:`;
                        break;
                    default:
                        emoji = `:question:`;
                        break;
                }

                weatherEmbed.addFields(
                    { name: `${time}`, value: `${emoji} **${hour.IconPhrase}** - ${hour.Temperature.Value}°C`, inline: true }
                );
            });

            await interaction.reply({ embeds: [weatherEmbed] });
        } catch (error) {
            console.error('Error fetching weather:', error);
            await interaction.reply('Sorry, an error occurred while fetching the weather.');
        }
    },
};
