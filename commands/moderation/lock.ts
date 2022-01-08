import {
  CategoryChannel, Client, TextChannel, VoiceChannel,
} from 'discord.js';
import {Command} from '../../structures/structures/command';
import {lockReply, unlockReply, unsuportedChannel} from '../../translations/moderation/lockMessages';

export class Lock extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'lock',
      description: 'Moderation • Lock a text, category or voice channel.',
      permissions: ['MANAGE_CHANNELS'],
      options: [{
        name: 'channel',
        description: 'The channel that you want to lock.',
        required: false,
        type: 'CHANNEL',
      }],

      execute: async (interaction, language) => {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const {everyone} = interaction.guild!.roles;
        if (channel instanceof VoiceChannel) {
          channel.permissionOverwrites.edit(everyone, {
            CONNECT: false,
          });
        }
        if (channel instanceof TextChannel || channel instanceof CategoryChannel) {
          channel.permissionOverwrites?.edit(everyone, {
            SEND_MESSAGES: false,
          });
        } else {
          return interaction.reply({
            content: unsuportedChannel(language),
            ephemeral: true,
          });
        }
        interaction.reply(lockReply(language, interaction.user, channel));
      },
    }));
  }
}

export class Unlock extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'unlock',
      description: 'Moderation • Unlock a text, category or voice channel.',
      permissions: ['MANAGE_CHANNELS'],
      options: [{
        name: 'channel',
        description: 'The channel that you want to unlock.',
        required: false,
        type: 'CHANNEL',
      }],

      execute: async (interaction, language) => {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const {everyone} = interaction.guild!.roles;
        if (channel instanceof VoiceChannel) {
          channel.permissionOverwrites.edit(everyone, {
            CONNECT: null,
          });
        }
        if (channel instanceof TextChannel || channel instanceof CategoryChannel) {
          channel.permissionOverwrites?.edit(everyone, {
            SEND_MESSAGES: null,
          });
        } else {
          return interaction.reply({
            content: unsuportedChannel(language),
            ephemeral: true,
          });
        }
        interaction.reply(unlockReply(language, interaction.user, channel));
      },
    }));
  }
}
