import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, EmbedBuilder, GuildMember, VoiceChannel } from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { VoicePermissionService } from '../services/VoicePermissionService';
import { VoiceChannelPermission } from '../../../core/types';
import { DiscordHelper } from '../../../shared/discord/DiscordHelper';

@injectable()
export class AddCommand extends CommandBase {
  readonly name = 'add';
  readonly description = 'Temporary channels • Add a member in your temporary channel.';
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
          .setDescription('The users or roles that you want to add.')
          .setRequired(true)
      )
      .setDMPermission(false);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction, t } = context;
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;

    const membersInput = interaction.options.getString('members', true);
    const { members, notFound } = await DiscordHelper.fetchMembersAndRoles(
      membersInput,
      interaction.guild!
    );

    if (!members.length) {
      await interaction.reply({
        content: t('errors.memberNotFound'),
        ephemeral: true
      });
      return;
    }

    await this.voicePermissionService.applyPermission(
      channel,
      VoiceChannelPermission.ADD_MEMBER,
      members
    );

    const embed = new EmbedBuilder()
      .setColor('#96879d')
      .setAuthor({ name: channel.name, iconURL: member.user.avatarURL() || undefined })
      .addFields({ name: '\u200B', value: t('voice.messages.memberAdded', { members: members.join(', ') }) })
      .setTimestamp(Date.now())
      .setImage('https://i.imgur.com/dnwiwSz.png');

    await interaction.reply({ embeds: [embed], ephemeral: true });

    if (notFound) {
      await interaction.followUp({
        content: t('errors.memberNotFound'),
        ephemeral: true
      });
    }
  }
}
