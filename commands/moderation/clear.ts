import { Client, TextChannel } from 'discord.js';
import { Command } from '../../structures/structures/command';
import { clearError, clearReply } from '../../translations/moderation/clearMessages';

export class Clear extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'clear',
      description: 'Moderation • Clear a number of messages from this channel.',
      permissions: ['MANAGE_MESSAGES'],
      options: [{
        name: 'number',
        description: 'The number of messages that will be deleted.',
        required: true,
        type: 'NUMBER',
      }],

      execute: async (interaction, language) => {
        const number = interaction.options.getNumber('number')!;
        const channel = interaction.options.getChannel('channel') || interaction.channel!;
        if (channel instanceof TextChannel) {
          await channel.bulkDelete(number);
          await interaction.reply(clearReply(language, number, channel));
        } else {
          interaction.reply({
            content: clearError(language),
            ephemeral: true,
          });
        }
      },
    }));
  }
}
