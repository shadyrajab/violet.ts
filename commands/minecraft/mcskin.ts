import {Client} from 'discord.js';
import fetch from 'cross-fetch';
import {Command} from '../../structures/structures/command';
import {userNotFound} from '../../translations/globalMessages';

export class MinecraftSkin extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'minecraftskin',
      description: 'Minecraft • Display a minecraft user skin.',
      direct: true,
      options: [{
        name: 'nickname',
        description: 'The nickname of the user.',
        type: 'STRING',
        required: true,
      }],

      execute: async (interaction, language) => {
        const username = interaction.options.getString('nickname')!;
        const request = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (request.status === 200) {
          const user = await request.json();
          const skin = `https://crafatar.com/skins/${user.id}`;
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
