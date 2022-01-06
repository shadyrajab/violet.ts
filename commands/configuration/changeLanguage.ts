import { Client, Guild } from 'discord.js';
import { changeLanguageReply } from '../../translations/configuration/changeLanguageMessages';
import { GuildManager } from '../../structures/managers/guildManager';
import { Command } from '../../structures/structures/command';
import { Language } from '../../structures/structures/types';

export class ChangeLanguage extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'changelanguage',
      description: 'Configuration • Change the server language.',
      permissions: ['ADMINISTRATOR'],
      options: [{
        name: 'language',
        description: 'The language that you want.',
        required: true,
        type: 'STRING',
        choices: [{
          name: 'english',
          value: 'english',
        }, {
          name: 'portuguese',
          value: 'portuguese',
        }],
      }],

      execute: async (interaction) => {
        const guildManager = new GuildManager(interaction.guild as Guild);
        const language = interaction.options.getString('language') as Language;
        await guildManager.changeLanguage(language);
        interaction.reply({
          content: changeLanguageReply(language),
          ephemeral: true,
        });
      },
    }));
  }
}
