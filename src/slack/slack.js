const { WebClient } = require('@slack/web-api');
const { userToken, botToken } = require('../env');
const { sliceDate } = require('../shared/common');
const Sentry = require('../bugLogger/sentry');
const { UserException } = require('../bugLogger/exceptions');

// TODO: test this
// TODO: switch to typescript

const web = new WebClient(userToken);
// const webForBot = new WebClient(botToken);
let timeoutID;

const getUserProfile = async () => {
  try {
    const { profile } = await web.users.profile.get();
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
  };
};

const removeOOO = async (slackBlocks) => {
  try {
    clearTimeout(timeoutID);

    let displayName = await getUserProfile();

    const oooIndex = displayName.indexOf('OOO');
    if (oooIndex >= 0) {
      displayName = displayName.slice(0, oooIndex - 1);
    }

    await web.users.profile.set({
      profile: {
        display_name: displayName,
        status_text: '',
        status_emoji: '',
      },
    });

    await web.dnd.endSnooze();

    await web.users.setPresence({
      presence: 'auto',
    });

    return [
      { ...slackBlocks.plainText('Welcome back! You are *now active*. Have a great day :sunglasses:') },
    ];
  } catch (error) {
    Sentry.captureException(error, 'removeOOO method');
    return [
      { ...slackBlocks.plainText('*Something went terribly wrong. Please try again :pensive: *') },
    ];
  }
};

const addOOO = async (payload, slackBlocks) => {
  try {
    const { actions: [{ selected_date: selectedDate }] } = payload;
    const { timeInMilliseconds, dateString } = getDate(selectedDate);
    const now = Date.now();
    const dndMilliSeconds = timeInMilliseconds - now;
    const dndMinutes = dndMilliSeconds / 60000;

    if (timeInMilliseconds < now) {
      return [
        { ...slackBlocks.plainText('*`Please pick today or a day after today`* :confused: ') },
        { ...slackBlocks.datePicker() },
      ];
    }

    // const displayName = await getUserProfile();
    // const newDisplayName = `${displayName} OOO`;

    // await web.users.profile.set({
    //   profile: {
    //     display_name: newDisplayName,
    //     status_text: `OOO till ${dateString}`,
    //     status_emoji: ':x:',
    //     status_expiration: timeInMilliseconds / 1000,
    //   },
    // });

    // await web.users.setPresence({
    //   presence: 'away',
    // });

    // await web.dnd.setSnooze({
    //   num_minutes: dndMinutes,
    // });

    // timeoutID = setTimeout(async () => {
    //   const blocks = await removeOOO(slackBlocks);
    //   blocks.push({ type: 'divider' });

    //   try {
    //     // post message as bot user
    //     await webForBot.chat.postMessage({
    //       channel: 'UFBD46Y3V',
    //       text: 'Welcome Back!',
    //       blocks,
    //     });
    //   } catch (error) {
    //     Sentry.captureException(error, 'settimeout to remove OOO');
    //     console.log(error);
    //   }
    // }, dndMilliSeconds);

    // print('>>>>>>>>>>here');
    // return [
    //   { ...slackBlocks.plainText(`You are now OOO. Your profile will be *_automatically reset on ${dateString} at 00:00_*.`) },
    //   { ...slackBlocks.plainText('Have a restful break :sleeping:') },
    // ];

    // return [
    //   { ...slackBlocks.formModal() },
    // ];
  } catch (error) {
    Sentry.captureException(error, 'addOOO method');
    return [
      { ...slackBlocks.plainText('*Something went terribly wrong. Please try again :pensive: *') },
    ];
  }
};

module.exports = {
  addOOO,
  removeOOO,
  getUserProfile,
};
