const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  token: process.env.SLACK_TOKEN,
  botToken: process.env.BOT_SLACK_TOKEN,
  PORT: process.env.PORT
};
