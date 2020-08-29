const Sentry = require("@sentry/node");
const { dsn } = require('../env');

Sentry.init({ dsn });

module.exports = Sentry;
