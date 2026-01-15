import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { VoiceProfileService } from '../services/VoiceProfileService';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';
import { ProfileType } from '../entities/VoiceProfile';

@injectable()
export class SetupCommand extends CommandBase {
  readonly name = 'setup';
  readonly description = 'Create a voice channel or cinema profile';
  readonly permissions: CommandPermission[] = ['ManageChannels'];
  readonly guildOnly = true;

  constructor(
    @inject(VoiceProfileService) private voiceProfileService: VoiceProfileService
  ) {
    super();
  }

  buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addStringOption(option =>
        option
          .setName('type')
          .setDescription('Type of profile to create')
          .setRequired(true)
          .addChoices(
            { name: 'Temporary Voice Channels', value: 'voice' },
            { name: 'Cinema Sessions', value: 'cinema' }
          )
      )
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Name of the profile/category')
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(50)
      ) as SlashCommandBuilder;
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;
    const profileType = interaction.options.getString('type', true) as ProfileType;
    const profileName = interaction.options.getString('name', true);

    await interaction.deferReply({ ephemeral: true });

    try {
      const profile = await this.voiceProfileService.createProfile(
        guild,
        interaction.user.id,
        profileName,
        profileType
      );

      const category = await guild.channels.fetch(profile.categoryId);

      if (profileType === 'cinema') {
        await interaction.editReply({
          embeds: [
            embedBuilder.createSuccessEmbed(
              'Cinema Profile Created',
              `Cinema profile **${profileName}** has been created!\n\n` +
              `📁 Category: ${category?.name}\n\n` +
              `Use \`/session\` to create movie watching events.`
            )
          ]
        });
      } else {
        const joinChannel = profile.joinChannelId
          ? await guild.channels.fetch(profile.joinChannelId)
          : null;

        await interaction.editReply({
          embeds: [
            embedBuilder.createSuccessEmbed(
              'Voice Profile Created',
              `Voice profile **${profileName}** has been created!\n\n` +
              `📁 Category: ${category?.name}\n` +
              `🎙️ Join Channel: ${joinChannel?.name || 'N/A'}\n\n` +
              `Users can now join the voice channel to create temporary rooms.`
            )
          ]
        });
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [
          embedBuilder.createErrorEmbed(
            'Error Creating Profile',
            (error as Error).message
          )
        ]
      });
    }
  }
}
