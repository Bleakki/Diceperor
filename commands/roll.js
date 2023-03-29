const _ = require('lodash');

const { parseRoll, roll } = require('../common');


module.exports = {
  name: 'roll',
  description: 'Roll dice, also parses a skill roll.',
  helpText: 'Roll some dice, format is XdY+modifiers attribute. E.g. d100+50-10 70. If there\'s no arguments'
        + ' the default die is d100. If the attribute is given, degrees of failure/success will also be shown. '
        + 'The minimum and maximum thresholds are 0 and 100 respectively.',
  execute(message, commands) {
    const args = commands[0];

    let threshdold = null;
    if (!_.isEmpty(commands[1])) {
      threshdold = _.toInteger(commands[1]);
    }

    const { numberOfRolls, die, mod } = parseRoll(args);

    const { text } = roll(numberOfRolls, die, threshdold, mod);
    message.reply(text);
  },
};
