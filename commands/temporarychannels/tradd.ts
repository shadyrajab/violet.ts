import { Client, GuildMember, MessageEmbed } from 'discord.js';
import { Room } from '../../structures/managers/roomManager';
import { Command } from '../../structures/structures/command';
import { memberNotFound } from '../../translations/temporarychannels/globalMessages';
import { traddMemberReply, tremoveMemberReply } from '../../translations/temporarychannels/traddMessages';
import { getMembersAndRoles } from '../../utils/trFunctions';

export class TRAdd extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'tradd',
      description: 'Temporary channels • Add a member in your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],
      options: [{
        name: 'members',
        description: 'The users or roles that you want to add.',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const { members, notFound } = getMembersAndRoles(interaction.options.getString('members')!, interaction.guild!);
        if (!members.length) {
          return interaction.reply({
            content: memberNotFound(language),
            ephemeral: true,
          });
        }
        const room = new Room(channel);
        await room.manage({ method: 'ADD_MEMBER', members });
        const embed = new MessageEmbed()
          .setColor(0x2f3136)
          .setAuthor({ name: channel.name, iconURL: member.user.avatarURL()! })
          .addField('\u200B', traddMemberReply(language, members.join(', ')))
          .setTimestamp(Date.now())
          .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({ embeds: [embed], ephemeral: true });
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

export class TRemove extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'tremove',
      description: 'Temporary channels • Remove a member from your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],
      options: [{
        name: 'members',
        description: 'The users or roles that you want to remove.',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const { members, notFound } = getMembersAndRoles(interaction.options.getString('members')!, interaction.guild!);
        if (!members.length) {
          return interaction.reply({
            content: memberNotFound(language),
            ephemeral: true,
          });
        }
        const room = new Room(channel);
        await room.manage({ method: 'REMOVE_MEMBER', members });
        const embed = new MessageEmbed()
          .setColor(0x2f3136)
          .setAuthor({ name: channel.name, iconURL: member.user.avatarURL()! })
          .addField('\u200B', tremoveMemberReply(language, members.join(', ')))
          .setTimestamp(Date.now())
          .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({ embeds: [embed], ephemeral: true });
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
