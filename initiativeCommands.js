require('dotenv').config();
const _ = require('lodash');

const { Initiative } = require('./schemas/initiativeSchema');
const { Character } = require('./schemas/characterSchema');
const { PCList } = require('./schemas/pcListSchema');
const { rollDice } = require('./common');


async function getInit() {
  let initiative = await Initiative.findOne({}).exec();

  if (_.isNull(initiative)) {
    initiative = new Initiative({ characters: [] });
    await initiative.save();
  }

  return initiative;
}

async function initList() {
  const initiative = await getInit();
  const { characters } = initiative;

  if (_.isEmpty(characters)) {
    return 'No characters in the initiative.';
  }

  let text = initiative.active ? 'The initiative is:\n' : 'Characters added to the initiative list:\n';
  characters.forEach((character) => {
    if (!initiative.active) {
      text += `${character.name}: +${Math.floor(character.mod)}\n`;
    }
    else if (initiative.current === character.name) {
      text += `**${character.name}: ${Math.floor(character.order)}**\n`;
    }
    else {
      text += `${character.name}: ${Math.floor(character.order)}\n`;
    }
  });

  return text;
}

async function getSaved() {
  let saved = await PCList.findOne({}).exec();

  if (_.isNull(saved)) {
    saved = new PCList({ characters: [] });
    await saved.save();
  }

  return saved;
}

async function listSaved() {
  const { characters: savedCharacters } = await getSaved();

  let text = 'Saved characters:\n';
  savedCharacters.forEach((character) => {
    text += `${character.name}: +${Math.floor(character.mod)}\n`;
  });

  return text;
}

async function initSave({ name, mod, player = null }) {
  const character = new Character({ name, mod, player });

  const pcList = await getSaved();
  let savedCharacters = pcList.characters;

  if (_.find(savedCharacters, { name })) {
    return 'Character with that name already exists!';
  }


  savedCharacters.push(character);
  savedCharacters = _.orderBy(savedCharacters, 'order', 'desc');
  pcList.characters = savedCharacters;

  await PCList.updateOne(pcList);

  const message = `${name} saved to PC list!`;
  return message;
}

async function removeSaved(name) {
  const pcList = await getSaved();
  const { characters } = pcList;
  const removedCharacter = _.remove(characters, (character) => character.name === name);

  if (_.isEmpty(removedCharacter)) {
    return `Error! **${name}** isn't in the list of saved characters, try checking if the name is correct`;
  }

  pcList.characters = characters;
  await PCList.updateOne(pcList);

  let response = `${name} removed from the saved characters.\n`;
  response += await listSaved();

  return response;
}

async function initAdd({
  name, mod, player = null, automatic = false,
}) {
  const character = new Character({ name, mod, player });
  const initiative = await getInit();

  let { characters } = initiative;
  if (_.find(characters, { name })) {
    if (automatic) return '';

    return 'Character with that name already exists!';
  }

  let message = `${name} added to the initiative!`;

  if (initiative.active) {
    const [roll] = rollDice({ die: 10, mod: character.mod });
    character.order = roll + character.mod / 100;
  }

  characters.push(character);
  characters = _.orderBy(characters, 'order', 'desc');
  initiative.characters = characters;
  await Initiative.updateOne(initiative);

  if (initiative.active) {
    message += '\n';
    message += await initList();
  }

  return message;
}

async function addSaved() {
  const { characters: savedCharacters } = await getSaved();

  if (_.isEmpty(savedCharacters)) {
    return 'No saved characters';
  }

  let response = '';

  await Promise.all(savedCharacters.map(async (character) => {
    const {
      name,
      mod,
      player,
    } = character;

    response += await initAdd({
      name, mod, player, automatic: true,
    });
    response += '\n';
  }));


  for (const character of savedCharacters) { // eslint-disable-line
    const {
      name,
      mod,
      player,
    } = character;

    response += await initAdd({ // eslint-disable-line
      name, mod, player, automatic: true,
    });
    response += '\n';
  }

  // return 'PCs added to the initiative!';
  return response;
}

async function startInitiative() {
  const initiative = await getInit();

  let { characters } = initiative;
  if (_.isEmpty(characters)) {
    return 'Add some characters first!';
  }
  characters.forEach((character, i) => {
    const { mod } = character;
    let [roll] = rollDice({ die: 10, mod });
    roll += mod / 100;
    characters[i].order = roll;
  });

  characters = _.orderBy(characters, 'order', 'desc');

  initiative.characters = characters;
  initiative.active = true;
  initiative.current = characters[0].name;

  await Initiative.updateOne(initiative);

  let response = 'Initiative rolled!\n';
  response += await initList();

  return response;
}

async function initKill(name) {
  const initiative = await getInit();
  const { characters } = initiative;

  const killedCharacter = _.remove(characters, (charName) => charName.name === name);
  if (_.isEmpty(killedCharacter)) {
    return `Error! **${name}** isn't in the initiative list, try checking if the name is correct`;
  }

  initiative.characters = characters;
  await Initiative.updateOne(initiative);

  let response = `Boom! ${name} is dead! `;
  response += await initList();

  return response;
}

async function initNext() {
  const initiative = await getInit();
  const { characters } = initiative;

  const activeIndex = _.findIndex(characters, ['name', initiative.current]);
  let player;
  let newRound = false;
  if (activeIndex < (characters.length - 1)) {
    initiative.current = characters[activeIndex + 1].name;
    player = characters[activeIndex + 1].player;
  }
  else {
    initiative.current = characters[0].name;
    player = characters[0].player;
    newRound = true;
  }

  await Initiative.updateOne(initiative);
  let message = `It's now **${initiative.current}'s** turn!`;
  const oneLiners = [
    'Up the butt',
    'Git \'em!',
    'Don\'t fuck it up,',
    'JUST DO IT!',
    'Ask not for whom the bell tolls, it tolls for thee,',
    'Go kick some ass,',
    'Go kick some tushie,',
    'Hasta la vista,',
  ];
  const randPhrase = _.random(0, oneLiners.length - 1);

  message += player ? ` ${oneLiners[randPhrase]} ${player}` : '';
  message += newRound ? '\n**New round, reactions are reset!**' : '';

  return message;
}

async function initClear() {
  const initiative = await getInit();
  initiative.characters = [];
  initiative.active = false;
  await Initiative.updateOne(initiative);

  return 'Initiative cleared';
}

async function initStop() {
  const initiative = await getInit();

  initiative.active = false;

  await Initiative.updateOne(initiative);

  return 'Initiative stopped';
}

module.exports = {
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
};
