import { injectable, inject } from 'tsyringe';
import { SlashCommandBuilder, PermissionFlagsBits, AutocompleteInteraction, ChannelType } from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { VoiceProfileService } from '../services/VoiceProfileService';
import { VoiceRoomService } from '../services/VoiceRoomService';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@injectable()
export class DisableCommand extends CommandBase {
  readonly name = 'disable';
  readonly description = 'Delete a voice channel profile and all its channels';
  readonly permissions: CommandPermission[] = ['ManageChannels'];
  readonly guildOnly = true;

  constructor(
    @inject(VoiceProfileService) private voiceProfileService: VoiceProfileService,
    @inject(VoiceRoomService) private voiceRoomService: VoiceRoomService
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
          .setDescription('Name of the voice profile to delete')
          .setRequired(true)
          .setAutocomplete(true)
      ) as SlashCommandBuilder;
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.respond([]);
      return;
    }

    const profiles = await this.voiceProfileService.getGuildProfiles(guildId);

    const filtered = profiles
      .filter(profile => profile.name.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map(profile => ({
        name: `${profile.name}${profile.isActive ? '' : ' (disabled)'}`,
        value: profile.name
      }));

    await interaction.respond(filtered);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;
    const profileName = interaction.options.getString('profile', true);

    await interaction.deferReply({ ephemeral: true });

    try {
      const profile = await this.voiceProfileService.getProfile(profileName, guild.id);

      if (!profile) {
        await interaction.editReply({
          embeds: [
            embedBuilder.createErrorEmbed(
              'Profile Not Found',
              `Could not find a profile named **${profileName}**.`
            )
          ]
        });
        return;
      }

      const category = await guild.channels.fetch(profile.categoryId).catch(() => null);

      if (category && category.type === ChannelType.GuildCategory) {
        const children = Array.from(category.children.cache.values());

        for (const channel of children) {
          if (channel.type === ChannelType.GuildVoice) {
            const isRoom = await this.voiceRoomService.isRoom(channel.id);
            if (isRoom) {
              await this.voiceRoomService.deleteRoom(channel.id);
            }
            await channel.delete('Profile deleted').catch(() => {});
          }
        }

        await category.delete('Profile deleted').catch(() => {});
      }

      await this.voiceProfileService.deleteProfileFromDb(profile.id);

      await interaction.editReply({
        embeds: [
          embedBuilder.createSuccessEmbed(
            'Profile Deleted',
            `Voice profile **${profileName}** has been deleted.\n\n` +
            `All associated channels have been removed.`
          )
        ]
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          embedBuilder.createErrorEmbed(
            'Error Deleting Profile',
            (error as Error).message
          )
        ]
      });
    }
  }
}
