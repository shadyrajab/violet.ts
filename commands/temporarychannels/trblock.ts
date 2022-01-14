import {Client, GuildMember, MessageEmbed} from 'discord.js';
import {Room} from '../../structures/managers/roomManager';
import {Command} from '../../structures/structures/command';
import {memberNotFound} from '../../translations/temporarychannels/globalMessages';
import {trblockReply, trunblockReply} from '../../translations/temporarychannels/trblockMessages';
import {getMembersAndRoles} from '../../utils/trFunctions';

const {Colors: {grayishPurple}} = require('../../database/utils.json');

export class TRBlock extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trblock',
      description: 'Temporary channels • Block a member from your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],
      options: [{
        name: 'user',
        description: 'The user or role that you want to block.',
        required: true,
        type: 'STRING',
      }, {
        name: 'hide',
        description: 'If you want to hide the channel from this user.',
        required: true,
        type: 'BOOLEAN',
      }],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const {members, notFound} = getMembersAndRoles(interaction.options.getString('members')!, interaction.guild!);
        if (!members.length) {
          return interaction.reply({
            content: memberNotFound(language),
            ephemeral: true,
          });
        }
        const room = new Room(channel);
        await room.manage({method: 'BLOCK_MEMBER', members});
        const embed = new MessageEmbed()
            .setColor(grayishPurple)
            .setAuthor({name: channel.name, iconURL: member.user.avatarURL()!})
            .addField('\u200B', trblockReply(language, members.join(', ')))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
        if (notFound) {
          interaction.followUp({
            content: memberNotFound(language),
            ephemeral: true,
          });
        }
      },
    }));
  }
}

export class TRUnblock extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trunblock',
      description: 'Temporary channels • Unblock a member from your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],
      options: [{
        name: 'user',
        description: 'The user or role that you want to block.',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const {members, notFound} = getMembersAndRoles(interaction.options.getString('members')!, interaction.guild!);
        if (!members.length) {
          return interaction.reply({
            content: memberNotFound(language),
            ephemeral: true,
          });
        }
        const room = new Room(channel);
        await room.manage({method: 'UNBLOCK_MEMBER', members});
        const embed = new MessageEmbed()
            .setColor(grayishPurple)
            .setAuthor({name: channel.name, iconURL: member.user.avatarURL()!})
            .addField('\u200B', trunblockReply(language, members.join(', ')))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
        if (notFound) {
          interaction.followUp({
            content: memberNotFound(language),
            ephemeral: true,
          });
        }
      },
    }));
  }
}
