import {Client, Guild} from 'discord.js';
import {Command} from '../../structures/structures/command';
import {GuildManager} from '../../structures/managers/guildManager';
import {
  trsetupReply,
  alreadyActivated,
  trdisableReply,
  alreadyDisabled,
} from '../../translations/configuration/trsystemSetupMessages';

export class TRSetup extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trsetup',
      description: 'Configuration • Setup the temporary channels system.',
      permissions: ['ADMINISTRATOR'],

      execute: async (interaction, language, reason) => {
        const guild = interaction.guild as Guild;
        const guildManager = new GuildManager(guild);
        const {trcategory, trchannel} = await guildManager.getTrChannels();
        if (!trcategory && !trchannel) {
          const category = await guild.channels.create('Temporary Channels', {
            type: 'GUILD_CATEGORY',
            reason: reason,
          });
          const channel = await guild.channels.create('Join Here', {
            type: 'GUILD_VOICE',
            parent: category,
            reason: reason,
          });
          await guildManager.trSetup(category.id, channel.id);
          await interaction.reply({
            content: trsetupReply(language),
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: alreadyActivated(language),
            ephemeral: true,
          });
        }
      },
    }));
  }
}

export class TRDisable extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'trdisable',
      description: 'Configuration • Disable the temporary channels system.',
      permissions: ['ADMINISTRATOR'],

      execute: async (interaction, language, reason) => {
        const guild = interaction.guild as Guild;
        const guildManager = new GuildManager(guild);
        const {trcategory, trchannel} = await guildManager.getTrChannels();
        if (trcategory && trchannel) {
          trcategory.delete(reason);
          trchannel.delete(reason);
          await guildManager.trSetup(null, null);
          await interaction.reply({
            content: trdisableReply(language),
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: alreadyDisabled(language),
            ephemeral: true,
          });
        }
      },
    }));
  }
}
