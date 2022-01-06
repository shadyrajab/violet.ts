import { Client, MessageEmbed } from 'discord.js';
import fetch from 'cross-fetch';
import { Command } from '../../structures/structures/command';
import { userNotFound, dataNotFound } from '../../translations/globalMessages';
import { getChampion, getUserLastGames } from '../../utils/lolFunctions';
import { fetchEmoji } from '../../utils/fetchFunctions';
import { formatDecimal } from '../../utils/formatFunctions';

require('dotenv').config();

const { Ranks, Masteries } = require('../../database/emojis.json');

export class LolProfile extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'lolprofile',
      description: 'League of Legends • Display an user profile.',
      direct: true,
      options: [{
        name: 'server',
        description: 'The server where the user are registered.',
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
        description: 'The user nickname.',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        const username = interaction.options.getString('nickname') as string;
        const server = interaction.options.getString('server') as string;
        await interaction.deferReply();
        let region = 'americas';
        if (server === 'EUN1' || server === 'EUW1') region = 'europe';
        if (server === 'JP' || server === 'KR' || server === 'RU' || server === 'OC1' || server === 'TR1') region = 'asia';
        const request = await fetch(encodeURI(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${process.env.RGKEY}`));
        const summoner = await request.json();
        if (request.status === 404) {
          return await interaction.editReply({
            content: userNotFound(language, username),
          });
        }
        const secondRequest = await fetch(`https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}?api_key=${process.env.RGKEY}`);
        const queueStats = await secondRequest.json();
        let soloqTier = 'unranked'; let soloqRank = ''; let soloqPoints = 0; let soloqWins = 0; let soloqDefeats = 0; let soloqWinrate = 0; let
          soloqTierEmote = this.client.emojis.cache.get(Ranks.UNRANKED);
        let flexTier = 'unranked'; let flexRank = ''; let flexPoints = 0; let flexWins = 0; let flexDefeats = 0; let flexWinrate = 0; let
          flexTierEmote = this.client.emojis.cache.get(Ranks.UNRANKED);
        if (queueStats.length) {
          for (const queue of queueStats) {
            if (queue.queueType === 'RANKED_SOLO_5x5') {
              soloqTier = queue.tier.charAt(0) + queue.tier.slice(1).toLowerCase();
              soloqRank = queue.rank;
              soloqPoints = queue.leaguePoints;
              soloqWins = queue.wins;
              soloqDefeats = queue.losses;
              soloqTierEmote = this.client.emojis.cache.get(Ranks[queue.tier]);
              soloqWinrate = Math.floor(soloqWins / (soloqWins + soloqDefeats) * 100);
            } else if (queue.queueType === 'RANKED_FLEX_SR') {
              flexTier = queue.tier.charAt(0) + queue.tier.slice(1).toLowerCase();
              flexRank = queue.rank;
              flexPoints = queue.leaguePoints;
              flexWins = queue.wins;
              flexDefeats = queue.losses;
              flexTierEmote = this.client.emojis.cache.get(Ranks[queue.tier]);
              flexWinrate = Math.floor(flexWins / (flexWins + flexDefeats) * 100);
            }
          }
        }
        const thirdRequest = await fetch(`https://${server}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner.id}?api_key=${process.env.RGKEY}`);
        const mastery = await thirdRequest.json();
        if (!mastery.length || mastery.length < 3) {
          return interaction.editReply({
            content: dataNotFound(language),
          });
        }
        const firstChampion = await getChampion(mastery[0].championId.toString()) as string;
        const secondChampion = await getChampion(mastery[1].championId.toString()) as string;
        const thirdChampion = await getChampion(mastery[2].championId.toString()) as string;
        const firstChampionEmoji = await fetchEmoji(this.client, 'champion', firstChampion);
        const secondChampionEmoji = await fetchEmoji(this.client, 'champion', secondChampion);
        const thirdChampionEmoji = await fetchEmoji(this.client, 'champion', thirdChampion);
        const { wins, defeats, winrate } = await getUserLastGames(region, summoner, 10);
        const summonerIcon = `http://ddragon.leagueoflegends.com/cdn/11.17.1/img/profileicon/${summoner.profileIconId}.png`;
        const embed = new MessageEmbed()
          .setTitle(`League Profile: ${summoner.name}`)
          .setThumbnail(summonerIcon)
          .setColor(0x2f3136)
          .addField('Level/Region', `${summoner.summonerLevel} / ${server}`, true)
          .addField('Last Games', `${wins}W ${defeats}D / ${winrate}% WR`, true)
          .addField('Top mastery champions', `${firstChampionEmoji} ${this.client.emojis.cache.get(Masteries[mastery[0].championLevel])} **${firstChampion}** - ${formatDecimal(mastery[0].championPoints.toString())}\n${secondChampionEmoji} ${this.client.emojis.cache.get(Masteries[mastery[1].championLevel])} **${secondChampion}** - ${formatDecimal(mastery[1].championPoints.toString())}\n${thirdChampionEmoji} ${this.client.emojis.cache.get(Masteries[mastery[2].championLevel])} **${thirdChampion}** - ${formatDecimal(mastery[2].championPoints.toString())}`, false)
          .addField('Soloq Stats', `${soloqTierEmote} **${soloqTier} ${soloqRank}**\n\nLeague Points: **${soloqPoints} PDL**\nWins: **${soloqWins} /** Defeats: **${soloqDefeats}**\nWinrate: **${soloqWinrate}%**`, true)
          .addField('Flex Stats', `${flexTierEmote} **${flexTier} ${flexRank}**\n\nLeague Points: **${flexPoints} PDL**\nWins: **${flexWins} /** Defeats: **${flexDefeats}**\nWinrate: **${flexWinrate}%**`, true);
        interaction.editReply({ embeds: [embed] });
      },
    }));
  }
}
