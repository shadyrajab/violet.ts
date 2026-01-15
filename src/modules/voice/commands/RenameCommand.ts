import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, EmbedBuilder, GuildMember, VoiceChannel } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { VoicePermissionService } from '../services/VoicePermissionService';
import { VoiceChannelPermission } from '../../../core/types';

@injectable()
export class RenameCommand extends CommandBase {
  readonly name = 'rename';
  readonly description = 'Temporary channels • Rename your temporary channel.';
  readonly permissions = ['TRCHANNEL_ADMIN' as const];
  readonly guildOnly = true;

  constructor(
    @inject(VoicePermissionService) private voicePermissionService: VoicePermissionService
  ) {
    super();
  }

  buildCommand() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('The new name of the channel')
          .setRequired(true)
      )
      .setDMPermission(false);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction, t } = context;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;

    const newName = interaction.options.getString('name', true);

    if (newName.length > 20) {
      await interaction.reply({
        content: t('errors.characterLimitReached', { limit: 20 }),
        ephemeral: true
      });
      return;
    }

    await this.voicePermissionService.applyPermission(
      channel,
      VoiceChannelPermission.RENAME,
      undefined,
      newName
    );

    const embed = new EmbedBuilder()
      .setColor('#96879d')
      .setAuthor({ name: channel.name, iconURL: member.user.avatarURL() || undefined })
      .addFields({ name: '\u200B', value: t('voice.messages.channelRenamed', { name: newName }) })
      .setTimestamp(Date.now())
      .setImage('https://i.imgur.com/dnwiwSz.png');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
