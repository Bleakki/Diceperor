const _ = require('lodash');

const {
  loadImage,
  parseRoll,
  roll,
  rollDice,
} = require('../common');


function getImage(status, folder) {
  const imageNumber = rollDice({ die: 6 });
  const image = loadImage(`${folder}/${status}_0${imageNumber}.jpg`);

  return image;
}

module.exports = {
  name: 'req-sub',
  noHelpList: true,
  execute(message, args, command) {
    const argList = [...args];
    const rollArgs = args[0];

    const folder = command === 'req' ? 'requisition' : 'subtlety';
    let image = '';
    let reply = '';
    if (argList[0] === 'win' || argList[0] === 'fail') {
      const status = argList[0] === 'win' ? 'success' : 'failure';
      image = getImage(status, folder);
    }
    else {
      let threshdold = null;
      if (!_.isEmpty(args[1])) {
        threshdold = _.toInteger(args[1]);
      }
      else {
        let infoReply = `If you're rolling a ${folder} test, please input the command as "${command} d100-X Y"`;
        infoReply += `If you just want to draw a succes / fail card, please input the command as "${command} win" or "${command} fail"`;
        message.reply(infoReply);
        return;
      }

      const { numberOfRolls, die, mod } = parseRoll(rollArgs);
      const { text, status, difference } = roll(numberOfRolls, die, threshdold, mod);
      reply = text;

      if (Math.abs(difference) >= 4) {
        image = getImage(status, folder);
      }
    }

    message.reply(reply, { files: !_.isEmpty(image) ? [image] : [] });
  },
};
