const axios = require('axios');
const Sentry = require('./bugLogger/sentry');
const { addOOO, removeOOO, getUserProfile } = require('./slack/slack');
const SlackBlocks = require('./slack/slackBlocks');

const helloOOOProfile = async (req, res) => {
  const slackBlocks = new SlackBlocks();
  const blocks = [];
  
  try {
    const displayName = await getUserProfile();
    const oooIndex = displayName.indexOf('OOO');

    if (oooIndex < 0) {
      blocks.push({ ...slackBlocks.plainText(`*Hey there! Let's change your profile to show you are OOO :smiley:*`)})
      blocks.push({ ...slackBlocks.datePicker() })
    }
    else {
      blocks.push({ ...slackBlocks.plainText('Do you want to *_remove_* your OOO profile?') })
      blocks.push({ ...slackBlocks.actions([['Cancel OOO?', 'danger']]) })
    }

    res.send({ blocks });
  } catch (error) {
    Sentry.captureException(error, 'helloOOOProfile method');
    const errorBlocks = [
      { ...slackBlocks.plainText('Something went *terribly wrong*. Please try again :pensive:.') }
    ];
    res.send({ blocks: errorBlocks });
  }
}

const setOOOProfile = async (req, res) => {
  let { payload } = req.body;
  payload = JSON.parse(payload);
  const { response_url: responseUrl, actions: [{ type }] } = payload;

  const slackBlocks = new SlackBlocks();
  let blocks;

  res.status(200).end();

  switch(type) {
    case('button'):
      blocks = await removeOOO(slackBlocks);
      break;

    case('datepicker'): 
      blocks = await addOOO(payload, slackBlocks);
      break;

    default:
      blocks = [
        { ...slackBlocks.plainText('*Sorry, we couldn\'t process that. Please try again :pensive: *') }
      ];
  }

  blocks.push({ "type": "divider" });

  axios
    .post(responseUrl, { blocks })
    .catch((error) => {
      console.error(error)
      Sentry.captureException(error, 'setOOOProfile method - axios failed to respond to slack url');
    })
}

module.exports = {
  helloOOOProfile,
  setOOOProfile
};
