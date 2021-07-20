const { sliceDate } = require('../shared/common');

class SlackBlocks {
  constructor() {
    const date = new Date();
    this.day = `${date.getFullYear()}-${sliceDate(date.getMonth() + 1)}-${sliceDate(date.getDate())}`;
  }

  datePicker = () => ({
    type: 'section',
    block_id: 'section-1',
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

  formModal = () => ({
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'What\'s your OOO message?',
    },
    submit: {
      type: 'plain_text',
      text: 'Submit',
    },
    close: {
      type: 'plain_text',
      text: 'Use defaults',
    },
    blocks: [
      { ...this.datePicker() },
      {
        label: {
          type: 'plain_text',
          text: 'Message',
        },
        type: 'input',
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'ooo_message',
          placeholder: {
            type: 'plain_text',
            text: 'Leave an OOO message for anyone who tries to reach out',
          },
        },
      },
    ],
  })
}

module.exports = SlackBlocks;
