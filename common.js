const { Parser } = require('expr-eval');
const random = require('math-random');
const path = require('path');

const _ = require('lodash');


function rollDice({ die = 100, numberOfRolls = 1, mod = 0 }) {
  const rolls = [];
  for (let i = 0; i < numberOfRolls; i += 1) {
    const roll = Math.floor(random() * Math.floor(die)) + 1;
    rolls.push(roll + mod);
  }

  return rolls;
}

module.exports = {
  parseRoll: (command) => {
    const args = _.split(command, 'd');

    // Setting the number of the die.
    const numberOfRolls = _.isEmpty(args[0]) ? 1 : _.toInteger(args[0]);

    // Setting die and the modifications.
    const dieAndMods = args[1];
    // Find the location where the modifications begin.
    const index = _.findIndex(dieAndMods, (char) => char === '+' | char === '-'); // eslint-disable-line
    let die;
    let mod;
    if (index > 0) {
      die = _.toInteger(dieAndMods.substring(0, index));
      mod = Parser.evaluate(dieAndMods.substring(index));
    }
    else {
      die = _.toInteger(args[1]);
      mod = 0;
    }

    // Basically if it's zero, it's undefined.
    die = die === 0 ? undefined : die;

    return {
      numberOfRolls,
      die,
      mod,
    };
  },

  loadImage: (fileName) => {
    const imagePath = path.join(__dirname, 'images', fileName);

    return imagePath;
  },
  rollDice,
  roll: (numberOfRolls, die, threshdold = null, mod = 0) => {
    const rolls = rollDice({ die, numberOfRolls });

    let message;
    let sum = _.sum(rolls);
    message = `The result is **${sum}** (${rolls})`;
    let status = null;
    let difference = null;

    if (!_.isNull(threshdold)) {
      let moddedThreshold = threshdold + mod;
      moddedThreshold = moddedThreshold > 100 ? 100 : moddedThreshold;

      if (moddedThreshold <= 0) {
        message += '. That\'s an impossible throw!';
        return message;
      }

      difference = Math.floor((moddedThreshold) / 10) - Math.floor(sum / 10);

      if (sum <= moddedThreshold) {
        message += ' Succeeded';
        status = 'success';
      }
      else {
        message += ' Failed';
        status = 'failure';
      }

      if (difference !== 0) {
        message += `, with ${Math.abs(difference)} extra degree(s) of ${status}.`;
      }
      else {
        message += '!';
      }
      message += ` Threshold after modifications was ${moddedThreshold}.`;
    }
    else {
      sum = _.sum(rolls) + mod;
      message = `The result is **${sum}** (${rolls}`;
      message += mod ? ` + ${mod}).` : ').';
    }

    return {
      text: message,
      status,
      difference,
    };
  },
};
