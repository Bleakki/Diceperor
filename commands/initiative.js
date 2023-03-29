const _ = require('lodash');


const {
  initAdd,
  initList,
  startInitiative,
  initKill,
  initNext,
  initClear,
  initStop,
  initSave,
  listSaved,
  addSaved,
  removeSaved,
} = require('../initiativeCommands');


module.exports = {
  name: 'init',
  description: 'Handles the initiative.',
  helpText: 'Handles initiative. The commands and arguments are:\n'
    + 'list *(lists all the characters in the initiative)*\n'
    + 'add <name> <modifier> <player> *(e.g. init add mook 3)*\n'
    + 'start *(starts the initiative, rolls initiative automatically)*\n'
    + 'next *(moves to the next character in the initiative)*\n'
    + 'kill <name> *(e.g. init kill mook)*\n'
    + 'stop *(stops the initiative, but preserves the characters in the initiative)*\n'
    + 'clear *(stops the initiative and kills all the characters)*\n'
    + 'save <name> <modifier> <player> *(saves a recurring character to a list, so they can be readded later)* *(e.g. init add mook 3)*\n'
    + 'saved *(lists saved characters)*\n'
    + 'pcs *(add saved characters to the initiative)*\n'
    + 'remove <name> *(remove a saved pc)*\n',
  async execute(message, commands) {
    const args = commands;
    let response = '';
    const command = args[0];

    if (args[0] === 'add' || args[0] === 'save') {
      args.shift();

      const [name, mod, player] = args;
      if (_.isEmpty(mod)) {
        response = 'Argument missing! The command is\'s init add <name> <modifier> <player(optional)>';
      }
      else if (command === 'add') {
        response = await initAdd({ name, mod, player });
      }
      else {
        response = await initSave({ name, mod, player });
      }
    }

    else if (args[0] === 'list') {
      response = await initList();
    }

    else if (args[0] === 'kill') {
      args.shift();
      if (_.isEmpty(args[0])) {
        response = 'Argument missing! The command is init kill <name>';
      }
      else {
        response = await initKill(args[0]);
      }
    }

    else if (args[0] === 'start') {
      response = await startInitiative();
    }

    else if (args[0] === 'next') {
      response = await initNext();
    }

    else if (args[0] === 'clear') {
      response = await initClear();
    }

    else if (args[0] === 'stop') {
      response = await initStop();
    }
    else if (args[0] === 'saved') {
      response = await listSaved();
    }
    else if (args[0] === 'pcs') {
      response = await addSaved();
    }
    else if (args[0] === 'remove') {
      args.shift();
      const [name] = args;

      response = await removeSaved(name);
    }

    message.reply(response);
  },
};
