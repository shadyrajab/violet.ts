import { Client } from 'discord.js'
import mongoose from 'mongoose'
import loadInteractionCommands  from './handler/commandHandler';
import interactionCreate from './events/interactionCreate';
import channelCreate from './events/channelCreation';
import channelDelete from './events/channelDelete';

const client = new Client({
    intents: [
       'Guilds',  'GuildVoiceStates', 'GuildMembers', 'GuildMessages'
    ]
})

const commands = loadInteractionCommands(client);

interactionCreate(client, commands);
channelCreate(client);
channelDelete(client);

client.on('ready', client => {
    console.log(`${client.user.username} está online`)
})

require('dotenv').config()

client.login(process.env.TOKEN)
mongoose.Promise = global.Promise;
mongoose.connect(process.env.CONNECTION as string, { dbName: 'discord' })
    .catch((err: Error) => console.log(`Error while connection: ${err}`));