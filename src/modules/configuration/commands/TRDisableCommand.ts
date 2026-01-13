import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { ServerService } from '../../servers/services/ServerService';
import {
  trdisableReply,
  alreadyDisabled
} from '../../../shared/translations/configuration/trsystemSetupMessages';

@injectable()
export class TRDisableCommand extends CommandBase {
  readonly name = 'trdisable';
  readonly description = 'Configuration • Disable the temporary channels system.';
  readonly permissions = ['Administrator' as const];
  readonly guildOnly = true;

  constructor(
    @inject(ServerService) private serverService: ServerService
  ) {
    super();
  }

  buildCommand() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDefaultMemberPermissions(0)
      .setDMPermission(false);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction, language } = context;
    const guild = interaction.guild!;

    const serverConfig = await this.serverService.getServerConfig(guild.id);

    if (!serverConfig?.categoryId || !serverConfig?.channelId) {
      await interaction.reply({
        content: alreadyDisabled(language),
        ephemeral: true
      });
      return;
    }

    const category = guild.channels.cache.get(serverConfig.categoryId);
    const channel = guild.channels.cache.get(serverConfig.channelId);

    if (category) {
      await category.delete(`Disabled by ${interaction.user.tag}`);
    }

    if (channel) {
      await channel.delete(`Disabled by ${interaction.user.tag}`);
    }

    await this.serverService.disableTemporaryChannels(guild.id);

    await interaction.reply({
      content: trdisableReply(language),
      ephemeral: true
    });
  }
}
