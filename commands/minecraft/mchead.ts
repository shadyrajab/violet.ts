import { Client } from 'discord.js';
import fetch from 'cross-fetch';
import { Command } from '../../structures/structures/command';
import { userNotFound } from '../../translations/globalMessages';

export class MinecraftHead extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'minecrafthead',
      description: 'Minecraft • Display a minecraft user head.',
      direct: true,
      options: [{
        name: 'nickname',
        description: 'The nickname of the user.',
        type: 'STRING',
        required: true,
      }],

      execute: async (interaction, language) => {
        const username = interaction.options.getString('nickname')!;
        const request = fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        const response = await request;
        if (response.status === 200) {
          const user = await response.json();
          const skin = `https://crafatar.com/avatars/${user.id}?overlay`;
          interaction.reply(skin);
        } else {
          interaction.reply({
            content: userNotFound(language, username),
            ephemeral: true,
          });
        }
      },
    }));
  }
}
