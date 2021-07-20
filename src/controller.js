const axios = require('axios');
const { WebClient } = require('@slack/web-api');
const Sentry = require('./bugLogger/sentry');
const {
  addOOO, removeOOO, getUserProfile,
} = require('./slack/slack');
const SlackBlocks = require('./slack/slackBlocks');
const { userToken } = require('./env');

const helloOOOProfile = async (req, res) => {
  const slackBlocks = new SlackBlocks();
  const blocks = [];

  try {
    const displayName = await getUserProfile();
    const oooIndex = displayName.indexOf('OOO');

    if (oooIndex < 0) {
      blocks.push({ ...slackBlocks.plainText('*Hey there! Let\'s change your profile to show you are OOO :smiley:*') });
      blocks.push({ ...slackBlocks.actions([['Set OOO', 'primary']], 'set-ooo') });
    } else {
      blocks.push({ ...slackBlocks.plainText('Do you want to *_remove_* your OOO profile?') });
      blocks.push({ ...slackBlocks.actions([['Cancel OOO?', 'danger']], 'cancel-ooo') });
    }

    res.send({ blocks });
  } catch (error) {
    Sentry.captureException(error, 'helloOOOProfile method');
    const errorBlocks = [
      { ...slackBlocks.plainText('Something went *terribly wrong*. Please try again :pensive:.') },
    ];
    res.send({ blocks: errorBlocks });
  }
};

const setOOOProfile = async (req, res) => {
  const slackBlocks = new SlackBlocks();

  try {
    const web = new WebClient(userToken);
    let blocks;
    let responseUrl;
    let { payload } = req.body;
    payload = JSON.parse(payload);

    if (payload.view) {
      if (payload.type === 'view_submission') {
        console.log('modal data 22 >>>>>>>>', payload);

        const { values } = payload.view.state;
        blocks = await addOOO(payload, slackBlocks);

        console.log('modal data 22 >>>>>>>>', payload.view.state.values);
      }
    } else {
      responseUrl = payload.response_url;
      const { trigger_id: triggerId, actions: [{ block_id: blockId }] } = payload;

      switch (blockId) {
        case ('cancel-ooo'):
          blocks = await removeOOO(slackBlocks);
          break;

        case ('set-ooo'):
          return await web.views.open({
            trigger_id: triggerId,
            view: slackBlocks.formModal(),
          });

        default:
          blocks = [
            { ...slackBlocks.plainText('*Sorry, we couldn\'t process that. Please try again :pensive: *') },
          ];
      }
    }

    blocks.push({ type: 'divider' });

    axios
      .post(responseUrl, { blocks })
      .catch((error) => {
        Sentry.captureException(error, 'setOOOProfile method - axios failed to respond to slack url');
      });
  } catch (error) {
    console.log('>>>>>>>>> error', error);
    Sentry.captureException(error, 'helloOOOProfile method');
    const errorBlocks = [
      { ...slackBlocks.plainText('Something went *terribly wrong*. Please try again :pensive:.') },
    ];
    res.send({ blocks: errorBlocks });
  }
};

module.exports = {
  helloOOOProfile,
  setOOOProfile,
};
