import {Client, GuildMember, MessageEmbed} from 'discord.js';
import {Room} from '../../structures/managers/roomManager';
import {Command} from '../../structures/structures/command';
import {trhideReply, trunhideReply} from '../../translations/temporarychannels/trhideMessages';

const {Colors: {grayishPurple}} = require('../../database/utils.json');

export class TRHide extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trhide',
      description: 'Temporary channels • Remove the visibility from your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const {everyone} = interaction.guild!.roles;
        const room = new Room(channel);
        await room.manage({method: 'LOCK', role: everyone});
        const embed = new MessageEmbed()
            .setColor(grayishPurple)
            .setAuthor({name: channel.name, iconURL: member.user.avatarURL()!})
            .addField('\u200B', trhideReply(language))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
      },
    }));
  }
}

export class TRUnhide extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trunhide',
      description: 'Temporary channels • Remove the invisibility from your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const {everyone} = interaction.guild!.roles;
        const room = new Room(channel);
        await room.manage({method: 'LOCK', role: everyone});
        const embed = new MessageEmbed()
            .setColor(grayishPurple)
            .setAuthor({name: channel.name, iconURL: member.user.avatarURL()!})
            .addField('\u200B', trunhideReply(language))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
      },
    }));
  }
}
