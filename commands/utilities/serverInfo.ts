import { Client, Guild, MessageEmbed } from 'discord.js';
import { Command } from '../../structures/structures/command';
import {
  creationDate,
  joiningDate,
  serverMembers,
  serverOwner,
  serverRegion,
} from '../../translations/utilities/infoMessages';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'Jule', 'August', 'Sectember', 'October', 'November', 'December'];

export class ServerInfo extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'serverinfo',
      description: 'Utility • Display the informations from this server.',

      execute: async (interaction, language) => {
        const guild = interaction.guild as Guild;
        const owner = await guild.fetchOwner();
        const boost = this.client.emojis.cache.get('920075898282180608');
        const createDate = guild.createdAt as Date;
        const joinDate = guild.joinedAt as Date;
        const premiumTier = guild.premiumTier !== 'NONE' ? guild.premiumTier : '0';
        const embed = new MessageEmbed()
          .setTitle(`**${guild.name}**`)
          .setColor(0x2f3136)
          .setThumbnail(guild.iconURL() || 'https://i.imgur.com/ZeNkX0r.png')
          .setTimestamp(Date.now())
          .addField(serverOwner(language), `\`${owner.user.username}#${owner.user.discriminator}\``, true)
          .addField(serverRegion(language), `${guild.preferredLocale}`, true)
          .addField(creationDate(language), `${months[createDate.getMonth()]} ${createDate.getDay()}th, ${createDate.getFullYear()}`, true)
          .addField(joiningDate(language), `${months[joinDate.getMonth()]} ${joinDate.getDay()}th, ${joinDate.getFullYear()}`, true)
          .addField(serverMembers(language), `\`${guild.memberCount}\``, true)
          .addField(`${boost} Boost Level`, `Level ${premiumTier}`, true);
        if (guild.banner) embed.setImage(guild.bannerURL() as string);
        await interaction.reply({ embeds: [embed] });
      },
    }));
  }
}
