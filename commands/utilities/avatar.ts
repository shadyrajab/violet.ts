import { Client, Message, MessageEmbed } from 'discord.js';
import { Command } from '../../structures/structures/command';
import { doYouKnowDani, whatDani, thatDani } from '../../translations/utilities/avatarMessages';

export class Avatar extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'avatar',
      description: 'Utility • Display your or another user avatar.',
      direct: true,
      options: [{
        name: 'user',
        description: 'The user or user ID.',
        required: false,
        type: 'USER',
      }],

      execute: async (interaction, language) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const embed = new MessageEmbed()
          .setImage(user.displayAvatarURL({ size: 2048, dynamic: true }))
          .setColor(0x2f3136)
          .setAuthor(user.username);

        const response = await interaction.reply({ embeds: [embed], fetchReply: true });

        if (user.id === interaction.client.user?.id && response instanceof Message) {
          const violetResponse = await response.reply(doYouKnowDani(language));
          setTimeout(async () => {
            const violetvResponse = await violetResponse.reply(whatDani(language));
            setTimeout(async () => {
              await violetvResponse.reply(thatDani(language));
            }, 1000);
          }, 1000);
        }
      },
    }));
  }
}
