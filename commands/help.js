const _ = require('lodash');


module.exports = {
  name: 'help',
  description: 'Help',
  helpText: `Type ${process.env.PREFIX}help <command name>.`,
  execute(message, helpArguments, commands) {
    const args = helpArguments;
    let helpText = '';
    if (_.isEmpty(args)) {
      helpText = '\n';
      const helpTextArray = commands.map((command) => {
        if (!command.noHelpList) {
          return command.name;
        }
        return false;
      });
      helpText += helpTextArray.join('\n');
    }
    else if (!_.isEmpty(commands.get(args[0]))) {
      const command = commands.get(args[0]);
      helpText = `${command.name}: ${command.helpText}`;
    }
    else {
      helpText = 'Can\'t find a command with that name.';
    }

    message.reply(helpText);
  },
};
