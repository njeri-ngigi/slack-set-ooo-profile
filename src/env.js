const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  userToken: process.env.USER_SLACK_TOKEN,
  botToken: process.env.BOT_SLACK_TOKEN,
  PORT: process.env.PORT,
  dsn: process.env.SENTRY_DSN,
};
