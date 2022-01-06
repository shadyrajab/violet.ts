import { Client } from 'discord.js';
import { Command } from '../../structures/structures/command';
import { changeMyLanguageReply } from '../../translations/configuration/changeLanguageMessages';
import { ProfileManager } from '../../structures/managers/profileManager';
import { Language } from '../../structures/structures/types';

export class ChangeMyLanguage extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'changemylanguage',
      description: "Configuration • Change your user's language.",
      direct: true,
      options: [{
        name: 'language',
        description: 'The language that I will talk with you.',
        required: true,
        type: 'STRING',
        choices: [{
          name: 'portuguese',
          value: 'portuguese',
        }, {
          name: 'english',
          value: 'english',
        }],
      }],

      execute: async (interaction) => {
        const language = interaction.options.getString('language') as Language;
        const profileManager = new ProfileManager(interaction.user);
        await profileManager.changeLanguage(language);
        interaction.reply({
          content: changeMyLanguageReply(language),
          ephemeral: true,
        });
      },
    }));
  }
}
