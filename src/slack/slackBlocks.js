const { sliceDate } = require('../shared/common');

class SlackBlocks {
  constructor() {
    const date = new Date();
    this.day = `${date.getFullYear()}-${sliceDate(date.getMonth()+1)}-${sliceDate(date.getDate())}`
  }

  datePicker = () => ({
    "type": "section",
    "block_id": "section-1",
    "text": {
      "type": "mrkdwn",
      "text": "When does your OOO end?"
    },
    "accessory": {
      "type": "datepicker",
      "action_id": "datepicker-1",
      "initial_date": this.day,
      "placeholder": {
        "type": "plain_text",
        "text": "Select a date"
      }
    }
  })

  button = ([btnText, style]) => ({
    "type": "button",
    "text": {
      "type": "plain_text",
      "text": btnText
    },
    style
  });

  actions = (buttonAttributes) => {
    const elements = [];

    for (const attribute of buttonAttributes) {
      elements.push(this.button(attribute))
    }

    return {
      "type": "actions",
      "block_id": "block-1",
      elements
    }
  }

  plainText = (text) => ({
    "type": "section",
    "text": {
      "type": "mrkdwn",
      text
    }
  })
}

module.exports = SlackBlocks;
