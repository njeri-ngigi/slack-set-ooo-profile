const { WebClient } = require('@slack/web-api');
const { userToken, botToken } = require('../env');
const { sliceDate } = require('../shared/common');
const Sentry = require('../bugLogger/sentry');
const { UserException } = require('../bugLogger/exceptions');

const web = new WebClient(userToken);
const webForBot = new WebClient(botToken);

const userAndTimeout = {};

const getUserProfile = async (userId) => {
  try {
    const { profile } = await web.users.profile.get({
      user: userId,
    });
    return profile.display_name;
  } catch (error) {
    Sentry.captureException(error);
    throw new UserException('Failed to get slack user profile', error);
  }
};

const getDate = (oooEndDate) => {
  const date = new Date(oooEndDate); // format: mm/dd/yy
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);

  return {
    timeInMilliseconds: date.getTime(),
    dateString: `${sliceDate(date.getDate())} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`,
    oooEndDate: date,
  };
};

const setOrCancelOOO = async (payload, slackBlocks) => {
  const { user: { id: userId } } = payload;

  const displayName = await getUserProfile(userId);
  const oooIndex = displayName.indexOf('OOO');
  const blocks = [];

  if (oooIndex < 0) {
    blocks.push({ ...slackBlocks.datePicker() });
  } else {
    blocks.push({ ...slackBlocks.plainText('*_Do you want to remove your OOO profile?_*') });
    blocks.push({ ...slackBlocks.actions([['Cancel OOO?', 'danger']], 'cancel-ooo') });
  }

  return blocks;
};

const removeOOO = async (payload, slackBlocks) => {
  try {
    const { user: { id: userId } } = payload;

    if (userAndTimeout[userId]) {
      clearTimeout(userAndTimeout[userId].timeoutId);
      delete userAndTimeout[userId];
    }

    let displayName = await getUserProfile(userId);

    const oooIndex = displayName.indexOf('OOO');
    if (oooIndex >= 0) {
      displayName = displayName.slice(0, oooIndex - 1);
    }

    web.users.profile.set({
      profile: {
        display_name: displayName,
        status_text: '',
        status_emoji: '',
      },
    });

    web.dnd.endSnooze();

    web.users.setPresence({
      presence: 'auto',
    });

    return [
      { ...slackBlocks.plainText('Welcome back! You are *now active*. Have a great day :sunglasses:') },
    ];
  } catch (error) {
    Sentry.captureException(error, 'removeOOO method');
    return [
      { ...slackBlocks.plainText('Something went terribly wrong. Please try again :pensive:') },
    ];
  }
};

const addOOO = async (payload, slackBlocks) => {
  try {
    const {
      actions: [{ selected_date: selectedDate }],
      user: { id: userId },
    } = payload;
    const { timeInMilliseconds, dateString, oooEndDate } = getDate(selectedDate);
    const now = Date.now();
    const dndMilliSeconds = timeInMilliseconds - now;
    const dndMinutes = dndMilliSeconds / 60000;

    if (timeInMilliseconds < now) {
      return [
        { ...slackBlocks.plainText('*`Please pick today or a day after today`* :confused: ') },
        { ...slackBlocks.datePicker() },
      ];
    }

    const displayName = await getUserProfile(userId);
    const newDisplayName = `${displayName} OOO`;

    web.users.profile.set({
      profile: {
        display_name: newDisplayName,
        status_text: `OOO till ${dateString}`,
        status_emoji: ':404parrotnotfound:',
        status_expiration: timeInMilliseconds / 1000,
      },
    });

    web.users.setPresence({
      presence: 'away',
    });

    web.dnd.setSnooze({
      num_minutes: dndMinutes,
    });

    const timeoutId = setTimeout(async () => {
      const blocks = await removeOOO(payload, slackBlocks);
      blocks.push({ type: 'divider' });

      try {
        // post message as bot user
        await webForBot.chat.postMessage({
          channel: userId,
          text: 'Welcome Back!',
          blocks,
        });
      } catch (error) {
        Sentry.captureException(error, 'settimeout to remove OOO');
      }
    }, dndMilliSeconds);

    userAndTimeout[userId] = { timeoutId, oooEndDate };

    return [
      { ...slackBlocks.plainText(`You are now OOO. Your profile will be *_automatically reset on ${dateString} at 00:00_*.`) },
      { ...slackBlocks.plainText('Have a restful break :sleeping:') },
    ];
  } catch (error) {
    Sentry.captureException(error, 'addOOO method');
    return [
      { ...slackBlocks.plainText('Something went terribly wrong. Please try again :pensive:') },
    ];
  }
};

module.exports = {
  addOOO,
  removeOOO,
  getUserProfile,
  setOrCancelOOO,
};
