const _ = require('lodash');

const { parseRoll, rollDice } = require('../common');

function rollDamage({ numberOfRolls = 1, die = 10, mod = 0 }, args) {
  let pen = 0;
  let toughness = 0;
  let armor = 0;
  let mook = false;
  let tearing = 0;
  args.forEach((arg) => {
    if (_.startsWith(arg, 'pen')) {
      pen = _.toInteger(arg.substring(3));
    }
    else if (_.startsWith(arg, 'tear')) {
      tearing = 1;
    }
    else if (_.startsWith(arg, 't')) {
      toughness = _.toInteger(arg.substring(1));
    }
    else if (_.startsWith(arg, 'a')) {
      armor = _.toInteger(arg.substring(1));
    }
    else if (_.startsWith(arg, 'mook')) {
      mook = true;
    }
  });

  armor = armor - pen >= 0 ? armor - pen : 0;
  const threshold = toughness + armor;


  const initialRolls = _.sortBy(rollDice({ numberOfRolls: numberOfRolls + tearing, die }));
  let rolls = initialRolls;
  if (tearing) {
    rolls = _.drop(initialRolls);
  }

  let righteous = 0;
  rolls.forEach((roll) => {
    if (die === roll) {
      righteous += 1;
    }
  });


  let damage = _.sum(rolls) + mod - threshold;
  if (damage < 0) {
    damage = 0;
  }

  let message = tearing ? `You rolled ${initialRolls}, dropping the lowest.\n` : '';
  message += `The result is **${_.sum(rolls) + mod}**  (${rolls}`;
  message += mod ? ` + ${mod})\n` : ')\n';
  message += `You did **${damage} damage**, after modifiers. ${damage === 0 ? '¯\\_(ツ)_/¯' : ''}`;

  if (righteous > 0 && !mook) {
    message += `\nYou triggered righteous fury ${righteous} time`;
    if (righteous > 1) {
      message += 's';
    }
    message += '!';
    if (damage > 0) {
      const righteousRolls = rollDice({ numberOfRolls: righteous, die: 5 });
      message += ` Rolls: **${righteousRolls}**.`;
    }
    else {
      message += ` You did **${righteous} damage**. It's something!`;
    }
  }

  return message;
}


module.exports = {
  name: 'dmg',
  description: 'Roll dice',
  helpText: 'Roll damage dice. E.g. 2d10+5 t5 a4 tear. The threshold can be calculated if the right parameters are given. '
        + 'Righteous fury will also be shown, and rolled automatically (or shown as extra damage).'
        + '\nParameters:'
        + '\naX = Armor X, for example a4'
        + '\ntX = Toughness X, for example t5'
        + '\npenX = Penetration X, for example pen3'
        + '\ntear = If the damge is tearing, will be automatically rolled'
        + '\nmook = If the attacker is a mook. Righteous fury won\'t be shown or calculated.',
  execute(message, commands) {
    const args = [...commands];
    // let args = _.clone(arguments);

    const { numberOfRolls, die, mod } = parseRoll(args[0]);

    args.shift();

    const text = rollDamage({ numberOfRolls, die, mod }, args);

    message.reply(text);
  },
};
