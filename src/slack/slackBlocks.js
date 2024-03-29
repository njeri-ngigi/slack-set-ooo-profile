const { sliceDate } = require('../shared/common');

class SlackBlocks {
  constructor() {
    const date = new Date();
    this.day = `${date.getFullYear()}-${sliceDate(date.getMonth() + 1)}-${sliceDate(date.getDate())}`;
  }

  datePicker = () => ({
    type: 'section',
    block_id: 'datepicker-ooo',
    text: {
      type: 'mrkdwn',
      text: 'When does your OOO end?',
    },
    accessory: {
      type: 'datepicker',
      action_id: 'datepicker-1',
      initial_date: this.day,
      placeholder: {
        type: 'plain_text',
        text: 'Select a date',
      },
    },
  })

  button = ([btnText, style]) => ({
    type: 'button',
    text: {
      type: 'plain_text',
      text: btnText,
    },
    style,
  });

  actions = (buttonAttributes, btnId) => {
    // shape of buttonAttributes: [[text, style], [text, style]]
    const elements = [];

    buttonAttributes.forEach((attributes) => {
      elements.push(this.button(attributes));
    });

    return {
      type: 'actions',
      block_id: btnId,
      elements,
    };
  }

  plainText = (text) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text,
    },
  })
}

module.exports = SlackBlocks;
