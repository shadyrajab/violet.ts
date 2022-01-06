import { Client, GuildMember, MessageEmbed } from 'discord.js';
import { Command } from '../../structures/structures/command';
import {
  creationDate,
  joiningDate,
  mainRole,
  secondaryRoles,
} from '../../translations/utilities/infoMessages';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'Jule', 'August', 'Sectember', 'October', 'November', 'December'];

export class UserInfo extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'userinfo',
      description: 'Utility • Display your or another user informations.',
      options: [{
        name: 'user',
        description: 'The user or user ID',
        required: false,
        type: 'USER',
      }],

      execute: async (interaction, language) => {
        const user = interaction.options.getUser('user');
        const { guild } = interaction;
        const member = user ? guild?.members.cache.get(user.id) as GuildMember : interaction.member as GuildMember;
        const roles = [] as Array <String>;
        const owner = member.user.id === guild?.ownerId ? '👑' : '';
        const createDate = member.user.createdAt as Date;
        const joinDate = member.joinedAt as Date;
        member.roles.cache.each((role) => {
          if (role.name !== '@everyone' && role !== member.roles.highest) roles.push(`<@&${role.id}>`);
        });
        const embed = new MessageEmbed()
          .setTitle(`${owner} ${member?.user.username}`)
          .setColor(0x2f3136)
          .setThumbnail(member.user.avatarURL() || 'https://i.imgur.com/ZeNkX0r.png')
          .setTimestamp(Date.now())
          .addField('🧾 Tag', `\`${member.user.username}#${member.user.discriminator}\``, true)
          .addField('📎 ID', `\`${member.user.id}\``, true)
          .addField(creationDate(language), `${months[createDate.getMonth()]} ${createDate.getDay()}th, ${createDate.getFullYear()}`, true)
          .addField(joiningDate(language), `${months[joinDate.getMonth()]} ${joinDate.getDay()}th, ${joinDate.getFullYear()}`, true);
        if (member.roles.highest.name !== '@everyone') embed.addField(mainRole(language), `<@&${member.roles.highest.id}>`, true);
        if (roles.length !== 0) embed.addField(secondaryRoles(language), roles.join(', '));
        await interaction.reply({ embeds: [embed] });
      },
    }));
  }
}
