import {
  Client, Message, MessageEmbed, MessageReaction, User,
} from 'discord.js';
import { Command } from '../../structures/structures/command';
import { ProfileManager } from '../../structures/managers/profileManager';
import {
  anyBadge,
  acquisitionDate,
  negociable,
  description,
  belongsTo,
  page,
} from '../../translations/community/badgesMessages';

const badges = require('../../database/badges.json');

export class Badge extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'badges',
      description: 'Badges • View your or another user badges.',
      direct: true,
      options: [{
        name: 'user',
        description: 'The user or user ID.',
        required: false,
        type: 'USER',
      }],

      execute: async (interaction, language) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const profileManager = new ProfileManager(user);
        const userBadges = await profileManager.getBadges();
        if (!userBadges.length) {
          return interaction.reply({
            content: anyBadge(language),
            ephemeral: true,
          });
        }
        let indent = 0;
        function embed(client: Client, indent: number) {
          const tierEmoji = client.emojis.cache.get('923300853035712522');
          const embed = new MessageEmbed()
            .setTitle(`${client.emojis.cache.get(badges[userBadges[indent].name].badgeID)} ${userBadges[indent].name}`)
            .setColor(badges[userBadges[indent].name].badgeColor)
            .setThumbnail(badges[userBadges[indent].name].badgeIcon)
            .addField(acquisitionDate(language), `\`${userBadges[indent].date}\``, true)
            .addField(negociable(language, client), `${badges[userBadges[indent].name].negociable}`, true)
            .addField(`${tierEmoji} Tier`, badges[userBadges[indent].name].badgeType, true)
            .addField(description(language), badges[userBadges[indent].name].description[language], false)
            .setImage(badges[userBadges[indent].name].badgeFooter)
            .setFooter(`${belongsTo(language)} ${user.username} • ${page(language)} ${indent + 1}/${userBadges.length}`, user.displayAvatarURL());
          return embed;
        }
        const response = await interaction.reply({ embeds: [embed(this.client, indent)], fetchReply: true }) as Message;
        if (userBadges.length > 1) {
          response.react('⬅️');
          response.react('➡️');
          const filter = (_reaction: MessageReaction, user: User) => user === interaction.user;
          const collector = response.createReactionCollector({ filter, time: 60000 });
          collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '➡️') {
              if (indent + 1 === userBadges.length) indent = (userBadges.length - 1) - indent;
              else indent += 1;
              response.edit({ embeds: [embed(this.client, indent)] });
            }
            if (reaction.emoji.name === '⬅️') {
              if (indent - 1 === -1) indent = userBadges.length - 1;
              else indent -= 1;
              response.edit({ embeds: [embed(this.client, indent)] });
            }
          });
        }
      },
    }));
  }
}
