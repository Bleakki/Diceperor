const fs = require('fs');

require('dotenv').config();
const Discord = require('discord.js');
// const mongoose = require('mongoose');

const initiativeCommands = require('./initiativeCommands');


let prefix = '!';
if (process.env.PREFIX) {
  prefix = process.env.PREFIX;
}

// console.log('init db'); // eslint-disable-line
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// const { connection } = mongoose;
//   connection.on('error', console.error.bind(console, 'connection error:')); // eslint-disable-line
// connection.once('open', () => {
// 	  console.log('connected'); // eslint-disable-line
// });

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`); // eslint-disable-line
  client.commands.set(command.name, command);
});


client.on('ready', () => {
  console.log('Started'); // eslint-disable-line

  client.user.setActivity(`${prefix}help to list commands`);
});

client.on('message', async (message) => {
  // Prevent loop, process messages only if they have the prefix.
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'test') {
    // message.reply('¯\\_(ツ)_/¯');
    initiativeCommands.initAdd({ name: 'havelock', mod: 5 });

    message.reply();
  }
  if (command === 'roll') {
    client.commands.get('roll').execute(message, args);
  }
  else if (command === 'rolld' || command === 'dmg') {
    client.commands.get('dmg').execute(message, args);
  }
  else if (command === 'help') {
    client.commands.get('help').execute(message, args, client.commands);
  }
  else if (command === 'init') {
    client.commands.get('init').execute(message, args);
  }
  else if (command === 'show') {
    client.commands.get('show').execute(message, args);
  }
  else if (command === 'req' || command === 'sub') {
    client.commands.get('req-sub').execute(message, args, command);
  }
  else {
    message.reply(`Uh, what? Try typing ${prefix}help for a list of commands.`);
  }
});

client.login(process.env.TOKEN);
