import { injectable, inject } from 'tsyringe';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { PresetService } from '../services/PresetService';
import { VoiceChannelPermission } from '../../../core/types';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@injectable()
export class PresetsCommand extends CommandBase {
  readonly name = 'presets';
  readonly description = 'Configure your voice channel preset settings';
  readonly permissions = undefined;
  readonly guildOnly = true;

  constructor(
    @inject(PresetService) private presetService: PresetService
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
    const { interaction } = context;
    const guild = interaction.guild!;
    const userId = interaction.user.id;

    let preset = await this.presetService.getPreset(userId, guild.id);

    if (!preset) {
      preset = await this.presetService.getOrCreatePreset(userId, guild.id);
    }

    const embed = this.createPresetEmbed(preset, interaction.user.username);
    const buttons = this.createButtons();

    const response = await interaction.reply({
      embeds: [embed],
      components: buttons,
      fetchReply: true
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000
    });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.user.id !== userId) {
        await buttonInteraction.reply({
          embeds: [embedBuilder.createErrorEmbed('Permission Denied', 'This is not your preset configuration')],
          ephemeral: true
        });
        return;
      }

      await this.handleButtonInteraction(buttonInteraction, context);

      const updatedPreset = await this.presetService.getPreset(userId, guild.id);
      if (updatedPreset) {
        const updatedEmbed = this.createPresetEmbed(updatedPreset, interaction.user.username);
        await response.edit({ embeds: [updatedEmbed] });
      }
    });

    collector.on('end', () => {
      response.edit({ components: [] }).catch(() => {});
    });
  }

  private createPresetEmbed(preset: any, username: string): EmbedBuilder {
    const lockStatus = preset.lock ? '🔒 Locked' : '🔓 Unlocked';
    const hideStatus = preset.hide ? '🙈 Hidden' : '👁️ Visible';

    const embed = new EmbedBuilder()
      .setColor('#96879d')
      .setTitle('🎙️ Voice Channel Preset Configuration')
      .setDescription(`Configure how your voice channels will be created by default`)
      .addFields(
        {
          name: '📝 Channel Name',
          value: preset.name || `${username}'s channel`,
          inline: true
        },
        {
          name: '📊 Status',
          value: `${lockStatus}\n${hideStatus}`,
          inline: true
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true
        }
      );

    if (preset.adminIds && preset.adminIds.length > 0) {
      const admins = preset.adminIds.map((id: string) => `<@${id}>`).slice(0, 10).join(', ');
      const moreCount = preset.adminIds.length > 10 ? ` (+${preset.adminIds.length - 10} more)` : '';
      embed.addFields({
        name: '👑 Admins',
        value: admins + moreCount,
        inline: true
      });
    }

    if (preset.memberIds && preset.memberIds.length > 0) {
      const members = preset.memberIds.map((id: string) => `<@${id}>`).slice(0, 10).join(', ');
      const moreCount = preset.memberIds.length > 10 ? ` (+${preset.memberIds.length - 10} more)` : '';
      embed.addFields({
        name: '✅ Allowed Members',
        value: members + moreCount,
        inline: true
      });
    }

    if (preset.blockedIds && preset.blockedIds.length > 0) {
      const blocked = preset.blockedIds.map((id: string) => `<@${id}>`).slice(0, 10).join(', ');
      const moreCount = preset.blockedIds.length > 10 ? ` (+${preset.blockedIds.length - 10} more)` : '';
      embed.addFields({
        name: '🚫 Blocked Members',
        value: blocked + moreCount,
        inline: true
      });
    }

    embed.setFooter({ text: 'Use the buttons below to configure your preset' });
    embed.setTimestamp();

    return embed;
  }

  private createButtons(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('preset_rename')
        .setLabel('Rename')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('preset_lock')
        .setLabel('Toggle Lock')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('preset_hide')
        .setLabel('Toggle Hide')
        .setEmoji('🙈')
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('preset_add_member')
        .setLabel('Add Member')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('preset_block_member')
        .setLabel('Block Member')
        .setEmoji('🚫')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('preset_delete')
        .setLabel('Reset')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Secondary)
    );

    return [row1, row2];
  }

  private async handleButtonInteraction(buttonInteraction: any, context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;

    switch (buttonInteraction.customId) {
      case 'preset_rename':
        await this.handleRename(buttonInteraction, interaction);
        break;
      case 'preset_lock':
        await this.handleLockToggle(buttonInteraction, interaction);
        break;
      case 'preset_hide':
        await this.handleHideToggle(buttonInteraction, interaction);
        break;
      case 'preset_add_member':
        await this.handleAddMember(buttonInteraction, interaction);
        break;
      case 'preset_block_member':
        await this.handleBlockMember(buttonInteraction, interaction);
        break;
      case 'preset_delete':
        await this.handleDelete(buttonInteraction, interaction);
        break;
    }
  }

  private async handleRename(buttonInteraction: any, interaction: any): Promise<void> {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');

    const modal = new ModalBuilder()
      .setCustomId(`preset_rename_modal_${interaction.user.id}`)
      .setTitle('Rename Voice Channel Preset');

    const nameInput = new TextInputBuilder()
      .setCustomId('preset_name')
      .setLabel('New Preset Name')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(25)
      .setPlaceholder('Enter preset name (max 25 characters)')
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(nameInput);
    modal.addComponents(actionRow as any);

    await buttonInteraction.showModal(modal);

    try {
      const modalSubmit = await buttonInteraction.awaitModalSubmit({
        time: 60000,
        filter: (i: any) => i.customId === `preset_rename_modal_${interaction.user.id}`
      });

      const newName = modalSubmit.fields.getTextInputValue('preset_name').trim();

      await this.presetService.updatePresetName(
        interaction.user.id,
        interaction.guild.id,
        newName
      );

      await modalSubmit.reply({
        embeds: [embedBuilder.createSuccessEmbed('Preset Renamed', `Preset name changed to **${newName}**`)],
        ephemeral: true
      });
    } catch (error) {
    }
  }

  private async handleLockToggle(buttonInteraction: any, interaction: any): Promise<void> {
    await buttonInteraction.deferReply({ ephemeral: true });

    const preset = await this.presetService.getPreset(interaction.user.id, interaction.guild.id);
    const newLockState = !preset?.lock;

    await this.presetService.updatePresetLock(
      interaction.user.id,
      interaction.guild.id,
      newLockState
    );

    await buttonInteraction.editReply({
      embeds: [embedBuilder.createSuccessEmbed(
        'Lock Updated',
        `Your voice channels will be ${newLockState ? '🔒 locked' : '🔓 unlocked'} by default`
      )]
    });
  }

  private async handleHideToggle(buttonInteraction: any, interaction: any): Promise<void> {
    await buttonInteraction.deferReply({ ephemeral: true });

    const preset = await this.presetService.getPreset(interaction.user.id, interaction.guild.id);
    const newHideState = !preset?.hide;

    await this.presetService.updatePresetHide(
      interaction.user.id,
      interaction.guild.id,
      newHideState
    );

    await buttonInteraction.editReply({
      embeds: [embedBuilder.createSuccessEmbed(
        'Visibility Updated',
        `Your voice channels will be ${newHideState ? '🙈 hidden' : '👁️ visible'} by default`
      )]
    });
  }

  private async handleDelete(buttonInteraction: any, interaction: any): Promise<void> {
    await buttonInteraction.deferReply({ ephemeral: true });

    await this.presetService.deletePreset(interaction.user.id, interaction.guild.id);

    await buttonInteraction.editReply({
      embeds: [embedBuilder.createSuccessEmbed('Preset Reset', 'Your preset has been reset to default settings')]
    });
  }

  private async handleAddMember(buttonInteraction: any, interaction: any): Promise<void> {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');

    const modal = new ModalBuilder()
      .setCustomId(`preset_add_member_modal_${interaction.user.id}`)
      .setTitle('Add Member to Preset');

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel('User ID, Username, or @mention')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder('Enter user ID, username, or @mention')
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(userInput);
    modal.addComponents(actionRow as any);

    await buttonInteraction.showModal(modal);

    try {
      const modalSubmit = await buttonInteraction.awaitModalSubmit({
        time: 60000,
        filter: (i: any) => i.customId === `preset_add_member_modal_${interaction.user.id}`
      });

      const input = modalSubmit.fields.getTextInputValue('user_identifier').trim();

      await modalSubmit.deferReply({ ephemeral: true });

      try {
        let targetMember: any = null;

        const idMatch = input.match(/^<@!?(\d+)>$/) || input.match(/^(\d+)$/);
        if (idMatch) {
          const userId = idMatch[1];
          targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
        }

        if (!targetMember) {
          const members = await interaction.guild.members.fetch();
          targetMember = members.find((m: any) =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            m.user.tag.toLowerCase() === input.toLowerCase() ||
            m.displayName.toLowerCase() === input.toLowerCase()
          ) || null;
        }

        if (!targetMember) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed('User Not Found', 'Could not find the specified user')]
          });
          return;
        }

        await this.presetService.updatePresetField(
          interaction.user.id,
          interaction.guild.id,
          VoiceChannelPermission.ADD_MEMBER,
          targetMember.id
        );

        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed('Member Added', `**${targetMember.user.username}** will be allowed in your channels by default`)]
        });
      } catch (error) {
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed('Error', 'Failed to add member')]
        });
      }
    } catch (error) {
    }
  }

  private async handleBlockMember(buttonInteraction: any, interaction: any): Promise<void> {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');

    const modal = new ModalBuilder()
      .setCustomId(`preset_block_member_modal_${interaction.user.id}`)
      .setTitle('Block Member from Preset');

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel('User ID, Username, or @mention')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder('Enter user ID, username, or @mention')
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(userInput);
    modal.addComponents(actionRow as any);

    await buttonInteraction.showModal(modal);

    try {
      const modalSubmit = await buttonInteraction.awaitModalSubmit({
        time: 60000,
        filter: (i: any) => i.customId === `preset_block_member_modal_${interaction.user.id}`
      });

      const input = modalSubmit.fields.getTextInputValue('user_identifier').trim();

      await modalSubmit.deferReply({ ephemeral: true });

      try {
        let targetMember: any = null;

        const idMatch = input.match(/^<@!?(\d+)>$/) || input.match(/^(\d+)$/);
        if (idMatch) {
          const userId = idMatch[1];
          targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
        }

        if (!targetMember) {
          const members = await interaction.guild.members.fetch();
          targetMember = members.find((m: any) =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            m.user.tag.toLowerCase() === input.toLowerCase() ||
            m.displayName.toLowerCase() === input.toLowerCase()
          ) || null;
        }

        if (!targetMember) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed('User Not Found', 'Could not find the specified user')]
          });
          return;
        }

        await this.presetService.updatePresetField(
          interaction.user.id,
          interaction.guild.id,
          VoiceChannelPermission.BLOCK_MEMBER,
          targetMember.id
        );

        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed('Member Blocked', `**${targetMember.user.username}** will be blocked from your channels by default`)]
        });
      } catch (error) {
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed('Error', 'Failed to block member')]
        });
      }
    } catch (error) {
    }
  }
}
