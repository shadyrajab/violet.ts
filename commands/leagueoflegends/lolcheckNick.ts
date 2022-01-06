import { Client } from 'discord.js';
import fetch from 'cross-fetch';
import { Command } from '../../structures/structures/command';
import { availableTime, noneExistent } from '../../translations/leagueoflegends/checkNickMessages';
import { dataNotFound } from '../../translations/globalMessages';

require('dotenv').config();

export class CheckNick extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'lolchecknick',
      description: 'League of Legends • Check the available time from a nickname.',
      direct: true,
      options: [{
        name: 'server',
        description: 'The server where the nick are registered.',
        required: true,
        type: 'STRING',
        choices: [
          {
            name: 'BR',
            value: 'BR1',
          }, {
            name: 'EUNE',
            value: 'EUN1',
          }, {
            name: 'EUW',
            value: 'EUW1',
          }, {
            name: 'JP',
            value: 'JP1',
          }, {
            name: 'KR',
            value: 'KR',
          }, {
            name: 'LAN',
            value: 'LA1',
          }, {
            name: 'LAS',
            value: 'LA2',
          }, {
            name: 'NA',
            value: 'NA1',
          }, {
            name: 'OCE',
            value: 'OC1',
          }, {
            name: 'RU',
            value: 'RU',
          }, {
            name: 'TR',
            value: 'TR1',
          },
        ],
      }, {
        name: 'nickname',
        description: 'The nickname.',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        let region = 'americas';
        const username = interaction.options.getString('nickname') as string;
        const server = interaction.options.getString('server') as string;
        await interaction.deferReply({ ephemeral: true });
        if (server === 'EUN1' || server === 'EUW1') region = 'europe';
        if (server === 'JP' || server === 'KR' || server === 'RU' || server === 'OC1' || server === 'TR1') region = 'asia';
        const request = await fetch(encodeURI(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${process.env.RGKEY}`));
        const summoner = await request.json();
        if (request.status === 404) {
          return await interaction.editReply({
            content: noneExistent(language, username),
          });
        }
        const secondRequest = await fetch(`https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner.puuid}/ids?start=0&count=20&api_key=${process.env.RGKEY}`);
        const matchs = await secondRequest.json();
        if (!matchs.length) {
          return await interaction.editReply({
            content: dataNotFound(language),
          });
        }
        const thirdRequest = await fetch(`https://${region}.api.riotgames.com/lol/match/v5/matches/${matchs[0]}?api_key=${process.env.RGKEY}`);
        const lastMatch = await thirdRequest.json();
        const data = new Date(lastMatch.info.gameStartTimestamp);
        const diff = Math.abs(data.getTime() - new Date().getTime());
        const days = 910 - Math.ceil(diff / (1000 * 60 * 60 * 24));
        await interaction.editReply({
          content: availableTime(language, summoner.name, days),
        });
      },
    }));
  }
}
