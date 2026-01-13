import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { VoiceProfileService } from '../services/VoiceProfileService';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@injectable()
export class SetupCommand extends CommandBase {
  readonly name = 'setup';
  readonly description = 'Create a voice channel profile';
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
          .setName('profile')
          .setDescription('Name of the voice profile to create')
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(50)
      ) as SlashCommandBuilder;
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;
    const profileName = interaction.options.getString('profile', true);

    await interaction.deferReply({ ephemeral: true });

    try {
      const profile = await this.voiceProfileService.createProfile(
        guild,
        interaction.user.id,
        profileName
      );

      const category = await guild.channels.fetch(profile.categoryId);
      const joinChannel = await guild.channels.fetch(profile.joinChannelId);

      await interaction.editReply({
        embeds: [
          embedBuilder.createSuccessEmbed(
            '✅ Profile Created',
            `Voice profile **${profileName}** has been created successfully!\n\n` +
            `📁 Category: ${category?.name}\n` +
            `🎙️ Join Channel: ${joinChannel?.name}\n\n` +
            `Users can now join the voice channel to create temporary rooms.`
          )
        ]
      });
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
