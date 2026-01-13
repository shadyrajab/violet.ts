import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, EmbedBuilder, GuildMember, VoiceChannel } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { VoicePermissionService } from '../services/VoicePermissionService';
import { VoiceChannelPermission } from '../../../core/types';
import { DiscordHelper } from '../../../shared/discord/DiscordHelper';
import { memberNotFound } from '../../../shared/translations/temporarychannels/globalMessages';
import { tremoveMemberReply } from '../../../shared/translations/temporarychannels/traddMessages';

@injectable()
export class RemoveAdminCommand extends CommandBase {
  readonly name = 'emoveadmin';
  readonly description = 'Temporary channels • Remove an admin from your temporary channel.';
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
          .setName('members')
          .setDescription('The users or roles that you want to remove.')
          .setRequired(true)
      )
      .setDMPermission(false);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction, language } = context;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;

    const membersInput = interaction.options.getString('members', true);
    const { members, notFound } = await DiscordHelper.fetchMembersAndRoles(
      membersInput,
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
      VoiceChannelPermission.REMOVE_ADMIN,
      members
    );

    const embed = new EmbedBuilder()
      .setColor('#96879d')
      .setAuthor({ name: channel.name, iconURL: member.user.avatarURL() || undefined })
      .addFields({ name: '\u200B', value: tremoveMemberReply(language, members.join(', ')) })
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
