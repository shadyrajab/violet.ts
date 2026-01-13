import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, EmbedBuilder, GuildMember, VoiceChannel } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { VoicePermissionService } from '../services/VoicePermissionService';
import { VoiceChannelPermission } from '../../../core/types';
import { trunlockReply } from '../../../shared/translations/temporarychannels/trlockMessages';

@injectable()
export class TRUnlockCommand extends CommandBase {
  readonly name = 'trunlock';
  readonly description = 'Temporary channels • Unlock your temporary channel.';
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
      .setDMPermission(false);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction, language } = context;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;

    await this.voicePermissionService.applyPermission(
      channel,
      VoiceChannelPermission.UNLOCK
    );

    const embed = new EmbedBuilder()
      .setColor('#96879d')
      .setAuthor({ name: channel.name, iconURL: member.user.avatarURL() || undefined })
      .addFields({ name: '\u200B', value: trunlockReply(language) })
      .setTimestamp(Date.now())
      .setImage('https://i.imgur.com/dnwiwSz.png');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
