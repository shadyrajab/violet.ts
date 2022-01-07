import {Client, Intents} from 'discord.js';
import mongoose from 'mongoose';
import {fetchClientGuilds} from '../utils/fetchFunctions';
import getCommands from '../handler/commandHandler';
import interaction from '../events/interactionCreate';
import channelcreation from '../events/channelCreation';

require('dotenv').config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES],
});

const commands = getCommands(client);

interaction(client, commands);
channelcreation(client);

client.on('ready', (client) => {
  const guildsCount = client.guilds.cache.size;
  const usersCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
  client.user.setPresence({activities: [{name: 'use /getbadge'}], status: 'idle'});
  client.application.commands.set(commands);
  fetchClientGuilds(guildsCount);
  console.log(`${client.user.username} is online in ${guildsCount} servers with ${usersCount} users.`);
});
client.login(process.env.TOKEN as string);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.CONNECTION as string)
    .catch((err: Error) => console.log(`Error while connection: ${err}`));
