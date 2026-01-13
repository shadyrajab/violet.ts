import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { ServerService } from '../../servers/services/ServerService';
import {
  trsetupReply,
  alreadyActivated
} from '../../../shared/translations/configuration/trsystemSetupMessages';

@injectable()
export class TRSetupCommand extends CommandBase {
  readonly name = 'trsetup';
  readonly description = 'Configuration • Setup the temporary channels system.';
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

    if (serverConfig?.categoryId && serverConfig?.channelId) {
      await interaction.reply({
        content: alreadyActivated(language),
        ephemeral: true
      });
      return;
    }

    const category = await guild.channels.create({
      name: 'Temporary Channels',
      type: ChannelType.GuildCategory,
      reason: `Configured by ${interaction.user.tag}`
    });

    const channel = await guild.channels.create({
      name: 'Join Here',
      type: ChannelType.GuildVoice,
      parent: category,
      reason: `Configured by ${interaction.user.tag}`
    });

    await this.serverService.setupTemporaryChannels(guild.id, category.id, channel.id);

    await interaction.reply({
      content: trsetupReply(language),
      ephemeral: true
    });
  }
}
