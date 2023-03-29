module.exports = {
  name: 'show',
  description: 'Show various info, by typing show <argument>.',
  helpText: 'hits - Show hit locations',
  execute(message, commands) {
    const args = commands[0];
    let text = '\n';

    switch (args) {
      case 'hits':
        text += 'Head: 01-10\n';
        text += 'Body: 31-70\n';
        text += 'Right Arm: 11-20\n';
        text += 'Left Arm: 21-30\n';
        text += 'Right Leg: 71-85\n';
        text += 'Left Leg: 86-100\n';
        break;
      default:
        text = this.helpText;
    }

    message.reply(text);
  },
};
