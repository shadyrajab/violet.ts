import {Client, GuildMember, MessageEmbed} from 'discord.js';
import {Room} from '../../structures/managers/roomManager';
import {Command} from '../../structures/structures/command';
import {trlockReply, trunlockReply} from '../../translations/temporarychannels/trlockMessages';

const {Colors: {grayishPurple}} = require('../../database/utils.json');

export class TRLock extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trlock',
      description: 'Temporary channels • Lock your temporary channel.',
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
            .addField('\u200B', trlockReply(language))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
      },
    }));
  }
}

export class TRUnlock extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trunlock',
      description: 'Temporary channels • Unlock your temporary channel.',
      permissions: ['TRCHANNEL_ADMIN'],

      execute: async (interaction, language) => {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const {everyone} = interaction.guild!.roles;
        const room = new Room(channel);
        await room.manage({method: 'UNLOCK', role: everyone});
        const embed = new MessageEmbed()
            .setColor(grayishPurple)
            .setAuthor({name: channel.name, iconURL: member.user.avatarURL()!})
            .addField('\u200B', trunlockReply(language))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
      },
    }));
  }
}
