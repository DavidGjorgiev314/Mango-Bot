const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reel')
        .setDescription('Download an Instagram reel from a URL!')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL of the Instagram reel')
                .setRequired(true)),

    async execute(interaction) {
        let reelUrl = interaction.options.getString('url');

        // Replace "reels" with "reel" if necessary
        if (reelUrl.includes('reels')) {
            reelUrl = reelUrl.replace('reels', 'reel');
        }

        // Trim URL after identifier
        const urlParts = reelUrl.split('/');
        reelUrl = urlParts.slice(0, 5).join('/');
        const encodedUrl = encodeURIComponent(reelUrl);

        const options = {
            method: 'GET',
            url: `https://instagram-reels-downloader6.p.rapidapi.com/api/v1/video?url=${encodedUrl}`,
            headers: {
                'x-rapidapi-key': 'b2d67092c0msh38775d9b1e56fc3p15368ajsne40cca79ea81',
                'x-rapidapi-host': 'instagram-reels-downloader6.p.rapidapi.com',
            },
        };

        try {
            await interaction.deferReply(); // Defer to avoid timeout

            // Make API request
            const response = await axios.request(options);

            if (!response.data || !response.data.video_url) {
                throw new Error('Video URL not found in API response.');
            }

            const videoUrl = response.data.video_url;

            // Download video
            const videoPath = path.join(__dirname, 'reel.mp4'); // Save to a temporary location
            const writer = fs.createWriteStream(videoPath);
            const videoResponse = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream',
            });

            videoResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Check file size
            const stats = fs.statSync(videoPath);
            const fileSizeInBytes = stats.size;
            const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

            if (fileSizeInMB > 8) {
                // File too large for Discord
                await interaction.followUp(`The downloaded video exceeds Discord's file size limit of 8 MB. Please use the link below to download it manually:\n${videoUrl}`);
            } else {
                // Upload video to Discord
                const attachment = new AttachmentBuilder(videoPath);
                await interaction.followUp({
                    content: 'Here is your Instagram reel video:',
                    files: [attachment],
                });
            }

            // Clean up the temporary file
            fs.unlinkSync(videoPath);
        } catch (error) {
            console.error('Error processing Instagram reel:', error.message);
            await interaction.followUp('Error processing the reel. Please check the URL and try again.');
        }
    },
};
