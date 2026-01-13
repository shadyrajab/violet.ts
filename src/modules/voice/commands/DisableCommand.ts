import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { VoiceProfileService } from '../services/VoiceProfileService';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@injectable()
export class DisableCommand extends CommandBase {
  readonly name = 'disable';
  readonly description = 'Disable a voice channel profile';
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
          .setDescription('Name of the voice profile to disable')
          .setRequired(true)
      ) as SlashCommandBuilder;
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;
    const profileName = interaction.options.getString('profile', true);

    await interaction.deferReply({ ephemeral: true });

    try {
      await this.voiceProfileService.disableProfile(profileName, guild.id);

      await interaction.editReply({
        embeds: [
          embedBuilder.createSuccessEmbed(
            '🔒 Profile Disabled',
            `Voice profile **${profileName}** has been disabled.\n\n` +
            `The bot will no longer create temporary channels for this profile.\n` +
            `The category and channels remain in the server but are inactive.`
          )
        ]
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          embedBuilder.createErrorEmbed(
            'Error Disabling Profile',
            (error as Error).message
          )
        ]
      });
    }
  }
}
