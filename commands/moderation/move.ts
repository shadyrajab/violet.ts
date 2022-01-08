import {Client, StageChannel, VoiceChannel, TextChannel, CategoryChannel} from 'discord.js';
import {Command} from '../../structures/structures/command';
import {finished} from '../../translations/globalMessages';
import {newChannelError, originalChannelError} from '../../translations/moderation/moveMessages';

export class Move extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'move',
      description: 'Moderation • Move all the users from a channel to other channel.',
      permissions: ['ADMINISTRATOR'],
      options: [{
        name: 'originalchannel',
        description: 'The channel, or a category to select all the channels from the category.',
        required: true,
        type: 'CHANNEL',
      }, {
        name: 'newchannel',
        description: 'The channel to move the users.',
        required: true,
        type: 'CHANNEL',
      }],

      execute: async (interaction, language, reason) => {
        const originalChannel = interaction.options.getChannel('originalchannel');
        const newChannel = interaction.options.getChannel('newchannel');
        if (!(newChannel instanceof VoiceChannel || newChannel instanceof StageChannel)) {
          return interaction.reply({
            content: newChannelError(language),
            ephemeral: true,
          });
        }
        if (originalChannel instanceof TextChannel) {
          return interaction.reply({
            content: originalChannelError(language),
            ephemeral: true,
          });
        }

        if (originalChannel instanceof CategoryChannel) {
          for (const channel of originalChannel.children) {
            for (const member of channel[1].members) member[1].edit({channel: newChannel}, reason);
          }
        } else if (originalChannel instanceof VoiceChannel || originalChannel instanceof StageChannel) {
          for (const member of originalChannel.members) member[1].edit({channel: newChannel}, reason);
        }
        await interaction.reply({
          content: finished(language),
          ephemeral: true,
        });
      },
    }));
  }
}
