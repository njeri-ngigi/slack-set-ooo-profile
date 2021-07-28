const axios = require('axios');
const Sentry = require('./bugLogger/sentry');
const {
  addOOO, removeOOO, setOrCancelOOO,
} = require('./slack/slack');
const SlackBlocks = require('./slack/slackBlocks');

const helloOOOProfile = async (req, res) => {
  const slackBlocks = new SlackBlocks();

  try {
    res.send({
      blocks: [
        slackBlocks.plainText('*Hey there! Let\'s change your profile to reflect your OOO status :smiley:*'),
        slackBlocks.actions([['Set/Cancel OOO', 'primary']], 'set-cancel-ooo'),
      ],
    });
  } catch (error) {
    Sentry.captureException(error, 'helloOOOProfile method');
    const errorBlocks = [
      { ...slackBlocks.plainText('Something went terribly wrong. Please try again :pensive:.') },
    ];
    res.send({ blocks: errorBlocks });
  }
};

const setOOOProfile = async (req, res) => {
  const slackBlocks = new SlackBlocks();

  try {
    const payload = JSON.parse(req.body.payload);
    const responseUrl = payload.response_url;
    const { actions: [{ block_id: blockId }] } = payload;
    let blocks;

    res.send();

    switch (blockId) {
      case ('set-cancel-ooo'): {
        blocks = await setOrCancelOOO(payload, slackBlocks);
        break;
      }

      case ('cancel-ooo'):
        blocks = await removeOOO(payload, slackBlocks);
        break;

      case ('datepicker-ooo'):
        blocks = await addOOO(payload, slackBlocks);
        break;

      default:
        blocks = [
          { ...slackBlocks.plainText('*Sorry, we couldn\'t process that. Please try again :pensive: *') },
        ];
    }

    blocks.push({ type: 'divider' });

    return axios
      .post(responseUrl, { blocks })
      .catch((error) => {
        Sentry.captureException(error, 'setOOOProfile method - axios failed to respond to slack url');
      });
  } catch (error) {
    Sentry.captureException(error, 'helloOOOProfile method');
    const errorBlocks = [
      { ...slackBlocks.plainText('Something went terribly wrong. Please try again :pensive:.') },
    ];
    return res.send({ blocks: errorBlocks });
  }
};

module.exports = {
  helloOOOProfile,
  setOOOProfile,
};
