import { Client } from 'discord.js';
import { ProfileManager } from '../../structures/managers/profileManager';
import { Command } from '../../structures/structures/command';

export class GetBadge extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'getbadge',
      description: 'Badge • Get a limited badge.',
      direct: true,

      execute: async (interaction, language) => {
        const profileManager = new ProfileManager(interaction.user);
        profileManager.addBadge('Beta Tester', interaction, interaction.user, language, client);
      },
    }));
  }
}
