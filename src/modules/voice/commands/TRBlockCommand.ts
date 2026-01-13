import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, EmbedBuilder, GuildMember, VoiceChannel } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { VoicePermissionService } from '../services/VoicePermissionService';
import { VoiceChannelPermission } from '../../../core/types';
import { DiscordHelper } from '../../../shared/discord/DiscordHelper';
import { memberNotFound } from '../../../shared/translations/temporarychannels/globalMessages';
import { trblockReply } from '../../../shared/translations/temporarychannels/trblockMessages';

@injectable()
export class TRBlockCommand extends CommandBase {
  readonly name = 'trblock';
  readonly description = 'Temporary channels • Block a member from your temporary channel.';
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
          .setName('user')
          .setDescription('The user or role that you want to block.')
          .setRequired(true)
      )
      .addBooleanOption(option =>
        option
          .setName('hide')
          .setDescription('If you want to hide the channel from this user.')
          .setRequired(true)
      )
      .setDMPermission(false);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction, language } = context;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;

    const userInput = interaction.options.getString('user', true);
    const { members, notFound } = await DiscordHelper.fetchMembersAndRoles(
      userInput,
      interaction.guild!
    );

    if (!members.length) {
      await interaction.reply({
        content: memberNotFound(language),
        ephemeral: true
      });
      return;
    }

    await this.voicePermissionService.applyPermission(
      channel,
      VoiceChannelPermission.BLOCK_MEMBER,
      members
    );

    const embed = new EmbedBuilder()
      .setColor('#96879d')
      .setAuthor({ name: channel.name, iconURL: member.user.avatarURL() || undefined })
      .addFields({ name: '\u200B', value: trblockReply(language, members.join(', ')) })
      .setTimestamp(Date.now())
      .setImage('https://i.imgur.com/dnwiwSz.png');

    await interaction.reply({ embeds: [embed], ephemeral: true });

    if (notFound) {
      await interaction.followUp({
        content: memberNotFound(language),
        ephemeral: true
      });
    }
  }
}
