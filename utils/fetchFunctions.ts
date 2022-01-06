import { Client, Guild } from 'discord.js';
import fetch from 'cross-fetch';
import { dataScheme } from '../database/schemes/dataScheme';

export async function fetchCommandData(commandName: string) {
  const dataManager = await dataScheme.findOne({ id: 'commandsData' });
  let command = dataManager.commands[commandName];
  if (!command) command = dataManager.commands[commandName] = 0;
  dataManager.commands[commandName] = command += 1;
  await dataManager.updateOne({ commands: dataManager.commands });
  await dataManager.save().catch((err: Error) => console.log(err));
}

export function fetchClientGuilds(guildsCount: number) {
  fetch('https://top.gg/api/bots/862740130385494027/stats', {
    method: 'POST',
    headers: { Authorization: process.env.AUTHORIZATION, 'Content-Type': 'application/json' },
    body: JSON.stringify({ server_count: guildsCount }),
  } as RequestInit);
}

export async function fetchEmoji(client: Client, category: string, name: string) {
  let emoji = client.emojis.cache.find((emoji) => emoji.name === name);
  if (emoji) return emoji;
  let guild = client.guilds.cache.get('917046853927841842') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919590433783435275') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919590514662182962') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919590589002047598') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919590741863460894') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919590866409103401') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919590956649545798') as Guild;
  if (guild.emojis.cache.size >= 50) guild = client.guilds.cache.get('919591007664873482') as Guild;
  emoji = await guild.emojis.create(`http://ddragon.leagueoflegends.com/cdn/11.24.1/img/${category}/${name}.png`, name);
  return emoji;
}
