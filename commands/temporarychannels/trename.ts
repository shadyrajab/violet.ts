import {Client, GuildMember, MessageEmbed} from 'discord.js';
import {Room} from '../../structures/managers/roomManager';
import {Command} from '../../structures/structures/command';
import {charactersLimitReached} from '../../translations/temporarychannels/globalMessages';
import {trenameReply} from '../../translations/temporarychannels/trenameMessages';

const {Colors: {grayishPurple}} = require('../../database/utils.json');

export class TRename extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trename',
      description: 'Temporary channels • Rename your temporary channel.',
      options: [{
        name: 'name',
        description: 'The new name of the channel',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        const name = interaction.options.getString('name')!;
        if (name.length > 20) {
          return interaction.reply({
            content: charactersLimitReached(language, 20),
            ephemeral: true,
          });
        }
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel!;
        const room = new Room(channel);
        await room.manage({method: 'RENAME', name});
        const embed = new MessageEmbed()
            .setColor(grayishPurple)
            .setAuthor({name: channel.name, iconURL: member.user.avatarURL()!})
            .addField('\u200B', trenameReply(language, name))
            .setTimestamp(Date.now())
            .setImage('https://i.imgur.com/dnwiwSz.png');
        interaction.reply({embeds: [embed], ephemeral: true});
      },
    }));
  }
}
