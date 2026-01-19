const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const subsPath = path.join(__dirname, '../data/fastSubscribers.json');

module.exports = async function sendDailyFast(client) {
  if (!fs.existsSync(subsPath)) return;

  const subscribers = JSON.parse(fs.readFileSync(subsPath));
  if (!subscribers.length) return;

  let fastingRule = 'Непознато';

  try {
    const response = await axios.get('https://denovi.mk/');
    const $ = cheerio.load(response.data);

    fastingRule = $('#post img').attr('alt') || fastingRule;
  } catch (err) {
    console.error('Failed to fetch fasting rule:', err.message);
    return;
  }

  for (const userId of subscribers) {
    try {
      const emoji = `:bacon:`;
      if(fastingRule == `Масло`)
        emoji = `:olive:`;
      if(fastingRule == `Строг пост`)
        emoji = `:salad:`;
      if(fastingRule == `Риба`)
        emoji = `:fish:`;
      const user = await client.users.fetch(userId);
      await user.send(
        `Правило на пост за денес:\n${emoji} **${fastingRule}**`
      );
    } catch(err) {
      console.error(`Failed to send daily fast to users:`, err.message);
      return;
    }
  }
};