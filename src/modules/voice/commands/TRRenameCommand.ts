import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, EmbedBuilder, GuildMember, VoiceChannel } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { VoicePermissionService } from '../services/VoicePermissionService';
import { VoiceChannelPermission } from '../../../core/types';
import { charactersLimitReached } from '../../../shared/translations/temporarychannels/globalMessages';
import { trenameReply } from '../../../shared/translations/temporarychannels/trenameMessages';

@injectable()
export class TRRenameCommand extends CommandBase {
  readonly name = 'trename';
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
    const { interaction, language } = context;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;

    const newName = interaction.options.getString('name', true);

    if (newName.length > 20) {
      await interaction.reply({
        content: charactersLimitReached(language, 20),
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
      .addFields({ name: '\u200B', value: trenameReply(language, newName) })
      .setTimestamp(Date.now())
      .setImage('https://i.imgur.com/dnwiwSz.png');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
