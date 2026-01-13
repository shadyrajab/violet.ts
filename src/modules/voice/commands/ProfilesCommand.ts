import { injectable, inject } from 'tsyringe';
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { VoiceProfileService } from '../services/VoiceProfileService';
import { VoiceProfile } from '../entities/VoiceProfile';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@injectable()
export class ProfilesCommand extends CommandBase {
  readonly name = 'profiles';
  readonly description = 'View and manage voice channel profiles';
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
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;

    await interaction.deferReply({ ephemeral: true });

    try {
      const profiles = await this.voiceProfileService.getGuildProfiles(guild.id);

      if (profiles.length === 0) {
        await interaction.editReply({
          embeds: [
            embedBuilder.createInfoEmbed(
              '📋 No Profiles Found',
              'No voice profiles have been created in this server yet.\n\n' +
              'Use `/setup <profile-name>` to create your first profile.'
            )
          ]
        });
        return;
      }

      let currentPage = 0;
      const totalPages = profiles.length;

      const getMessage = async (page: number) => {
        const profile = profiles[page];
        const embed = await this.createProfileEmbed(profile, guild, page + 1, totalPages);
        const buttons = this.createButtons(page, totalPages, profile);
        return { embeds: [embed], components: [buttons] };
      };

      const response = await interaction.editReply(await getMessage(currentPage));

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000
      });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          await buttonInteraction.reply({
            embeds: [embedBuilder.createErrorEmbed('Permission Denied', 'Only the command user can interact with these buttons')],
            ephemeral: true
          });
          return;
        }

        try {
          switch (buttonInteraction.customId) {
            case 'profile_prev':
              currentPage = Math.max(0, currentPage - 1);
              await buttonInteraction.update(await getMessage(currentPage));
              break;

            case 'profile_next':
              currentPage = Math.min(totalPages - 1, currentPage + 1);
              await buttonInteraction.update(await getMessage(currentPage));
              break;

            case 'profile_delete':
              await buttonInteraction.deferUpdate();
              await this.handleDelete(profiles[currentPage], guild, buttonInteraction);
              profiles.splice(currentPage, 1);
              if (profiles.length === 0) {
                await interaction.editReply({
                  embeds: [embedBuilder.createInfoEmbed('✅ All Profiles Deleted', 'No profiles remaining')],
                  components: []
                });
                collector.stop();
              } else {
                currentPage = Math.min(currentPage, profiles.length - 1);
                await interaction.editReply(await getMessage(currentPage));
              }
              break;

            case 'profile_create':
              await buttonInteraction.reply({
                embeds: [embedBuilder.createInfoEmbed('Create Profile', 'Use `/setup <profile-name>` to create a new profile')],
                ephemeral: true
              });
              break;

            case 'profile_toggle':
              await buttonInteraction.deferUpdate();
              await this.handleToggleStatus(profiles[currentPage], guild);
              await interaction.editReply(await getMessage(currentPage));
              break;
          }
        } catch (error) {
          await buttonInteraction.followUp({
            embeds: [embedBuilder.createErrorEmbed('Error', (error as Error).message)],
            ephemeral: true
          }).catch(() => {});
        }
      });

      collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => {});
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          embedBuilder.createErrorEmbed(
            'Error Loading Profiles',
            (error as Error).message
          )
        ]
      });
    }
  }

  private async createProfileEmbed(
    profile: VoiceProfile,
    guild: any,
    currentPage: number,
    totalPages: number
  ): Promise<EmbedBuilder> {
    const category = await guild.channels.fetch(profile.categoryId).catch(() => null);
    const joinChannel = await guild.channels.fetch(profile.joinChannelId).catch(() => null);
    const owner = await guild.members.fetch(profile.ownerId).catch(() => null);

    const statusEmoji = profile.isActive ? '✅' : '🔒';
    const statusText = profile.isActive ? 'Active' : 'Disabled';

    const embed = new EmbedBuilder()
      .setColor(profile.isActive ? '#00ff00' : '#ff0000')
      .setTitle(`📋 Voice Profile: ${profile.name}`)
      .setDescription(`${statusEmoji} **Status:** ${statusText}`)
      .addFields(
        {
          name: '👤 Owner',
          value: owner ? owner.user.username : `<@${profile.ownerId}>`,
          inline: true
        },
        {
          name: '📁 Category',
          value: category ? category.name : 'Not found',
          inline: true
        },
        {
          name: '🎙️ Join Channel',
          value: joinChannel ? joinChannel.name : 'Not found',
          inline: true
        },
        {
          name: '📅 Created',
          value: `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:R>`,
          inline: true
        },
        {
          name: '🔄 Last Updated',
          value: `<t:${Math.floor(profile.updatedAt.getTime() / 1000)}:R>`,
          inline: true
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true
        }
      )
      .setFooter({ text: `Page ${currentPage}/${totalPages} • Profile ID: ${profile.id}` })
      .setTimestamp();

    return embed;
  }

  private createButtons(currentPage: number, totalPages: number, profile: VoiceProfile): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('profile_prev')
        .setLabel('◀️ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0)
    );

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('profile_next')
        .setLabel('Next ▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages - 1)
    );

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('profile_toggle')
        .setLabel(profile.isActive ? '🔒 Disable' : '✅ Enable')
        .setStyle(profile.isActive ? ButtonStyle.Danger : ButtonStyle.Success)
    );

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('profile_delete')
        .setLabel('🗑️ Delete')
        .setStyle(ButtonStyle.Danger)
    );

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('profile_create')
        .setLabel('➕ New')
        .setStyle(ButtonStyle.Primary)
    );

    return row;
  }

  private async handleDelete(profile: VoiceProfile, guild: any, interaction: any): Promise<void> {
    await this.voiceProfileService.deleteProfile(profile.id, guild);
    await interaction.followUp({
      embeds: [embedBuilder.createSuccessEmbed('Profile Deleted', `Voice profile **${profile.name}** has been deleted`)],
      ephemeral: true
    });
  }

  private async handleToggleStatus(profile: VoiceProfile, guild: any): Promise<void> {
    if (profile.isActive) {
      await this.voiceProfileService.disableProfile(profile.name, guild.id);
    } else {
      await this.voiceProfileService.enableProfile(profile.name, guild.id);
    }
  }
}
