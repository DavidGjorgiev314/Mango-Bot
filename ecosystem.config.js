module.exports = {
  apps: [
    {
      name: 'mango-bot',
      script: 'main.js',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      time: true,
    },
  ],
};
