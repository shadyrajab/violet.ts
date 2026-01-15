import { injectable, inject } from 'tsyringe';
import {
  ButtonInteraction,
  ChannelType,
  VoiceChannel,
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder
} from 'discord.js';
import { VoiceRoomService } from './VoiceRoomService';
import { VoicePermissionService } from './VoicePermissionService';
import { VoiceChannelManagementService } from './VoiceChannelManagementService';
import { Logger } from '../../../core/logger';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';
import { VoiceChannelPermission } from '../../../core/types';
import { DiscordHelper } from '../../../shared/discord/DiscordHelper';
import { Locale, t, resolveLocale } from '../../../core/i18n';

@injectable()
export class VoiceButtonHandler {
  constructor(
    @inject(VoiceRoomService) private voiceRoomService: VoiceRoomService,
    @inject(VoicePermissionService) private voicePermissionService: VoicePermissionService,
    @inject(VoiceChannelManagementService) private voiceChannelManagementService: VoiceChannelManagementService,
    @inject(Logger) private logger: Logger
  ) {}

  async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    const locale = resolveLocale(interaction.locale);

    try {
      if (!interaction.customId.startsWith('vc_')) return;

      const member = interaction.member;
      if (!member || !interaction.guild) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))], ephemeral: true });
        return;
      }

      const voiceChannel = interaction.channel;
      if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.notConnected', undefined, locale))], ephemeral: true });
        return;
      }

      const room = await this.voiceRoomService.getRoom(voiceChannel.id);
      if (!room) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.notConnected', undefined, locale))], ephemeral: true });
        return;
      }

      const userId = typeof member.user === 'object' ? member.user.id : interaction.user.id;

      if (!room.hasPermission(userId)) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.notAdmin', undefined, locale))], ephemeral: true });
        return;
      }

      switch (interaction.customId) {
        case 'vc_lock':
          await interaction.deferReply({ ephemeral: true });
          await this.handleLock(interaction, voiceChannel, locale);
          break;
        case 'vc_unlock':
          await interaction.deferReply({ ephemeral: true });
          await this.handleUnlock(interaction, voiceChannel, locale);
          break;
        case 'vc_hide':
          await interaction.deferReply({ ephemeral: true });
          await this.handleHide(interaction, voiceChannel, locale);
          break;
        case 'vc_unhide':
          await interaction.deferReply({ ephemeral: true });
          await this.handleUnhide(interaction, voiceChannel, locale);
          break;
        case 'vc_rename':
          await this.handleRename(interaction, voiceChannel as VoiceChannel, room, locale);
          return;
        case 'vc_invite':
          await this.handleInvite(interaction, voiceChannel as VoiceChannel, room, locale);
          return;
        case 'vc_kick':
          await this.handleKick(interaction, voiceChannel as VoiceChannel, room, locale);
          return;
        case 'vc_setadmin':
          await this.handleSetAdmin(interaction, voiceChannel as VoiceChannel, room, locale);
          return;
        default:
          await interaction.reply({ embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))], ephemeral: true });
      }

      const message = await voiceChannel.messages.fetch(interaction.message.id).catch(() => null);
      if (message) {
        await this.voiceChannelManagementService.updateManagementEmbed(
          message,
          voiceChannel.name,
          room.ownerId,
          room,
          locale
        );
      }
    } catch (error) {
      this.logger.error('Error handling button interaction', error as Error, {
        customId: interaction.customId,
        userId: interaction.user.id
      });
      await interaction.editReply({ embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))] }).catch(() => {});
    }
  }

  private async handleLock(interaction: ButtonInteraction, channel: VoiceChannel, locale: Locale): Promise<void> {
    await this.voicePermissionService.lockChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed(t('voice.channel.locked', undefined, locale), t('voice.messages.channelLocked', undefined, locale))] });
  }

  private async handleUnlock(interaction: ButtonInteraction, channel: VoiceChannel, locale: Locale): Promise<void> {
    await this.voicePermissionService.unlockChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed(t('voice.channel.unlocked', undefined, locale), t('voice.messages.channelUnlocked', undefined, locale))] });
  }

  private async handleHide(interaction: ButtonInteraction, channel: VoiceChannel, locale: Locale): Promise<void> {
    await this.voicePermissionService.hideChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed(t('voice.channel.hidden', undefined, locale), t('voice.messages.channelHidden', undefined, locale))] });
  }

  private async handleUnhide(interaction: ButtonInteraction, channel: VoiceChannel, locale: Locale): Promise<void> {
    await this.voicePermissionService.unhideChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed(t('voice.channel.visible', undefined, locale), t('voice.messages.channelVisible', undefined, locale))] });
  }

  private async handleRename(interaction: ButtonInteraction, channel: VoiceChannel, room: any, locale: Locale): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_rename_modal_${channel.id}`)
      .setTitle(t('voice.modals.renameTitle', undefined, locale));

    const nameInput = new TextInputBuilder()
      .setCustomId('channel_name')
      .setLabel(t('voice.modals.renameLabel', undefined, locale))
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder(t('voice.modals.renamePlaceholder', undefined, locale))
      .setRequired(true);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    try {
      const modalSubmit = await interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === `vc_rename_modal_${channel.id}` });
      const newName = modalSubmit.fields.getTextInputValue('channel_name').trim();

      await modalSubmit.deferReply({ ephemeral: true });

      try {
        await this.voicePermissionService.applyPermission(channel, VoiceChannelPermission.RENAME, undefined, newName);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed(t('voice.channel.renamed', undefined, locale), t('voice.messages.channelRenamed', { name: newName }, locale))]
        });

        const managementMessage = (await channel.messages.fetch({ limit: 10 })).find(
          m => m.author.id === interaction.client.user?.id && m.embeds.length > 0 && m.embeds[0].title?.includes('Control Panel')
        );

        if (managementMessage) {
          await this.voiceChannelManagementService.updateManagementEmbed(managementMessage, newName, room.ownerId, room, locale);
        }
      } catch (error) {
        this.logger.error('Error renaming channel', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }

  private async handleInvite(interaction: ButtonInteraction, channel: VoiceChannel, room: any, locale: Locale): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_invite_modal_${channel.id}`)
      .setTitle(t('voice.modals.inviteTitle', undefined, locale));

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel(t('voice.modals.inviteLabel', undefined, locale))
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder(t('voice.modals.invitePlaceholder', undefined, locale))
      .setRequired(true);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(userInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    try {
      const modalSubmit = await interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === `vc_invite_modal_${channel.id}` });
      const input = modalSubmit.fields.getTextInputValue('user_identifier').trim();

      await modalSubmit.deferReply({ ephemeral: true });

      try {
        let targetMember: GuildMember | null = null;

        const idMatch = input.match(/^<@!?(\d+)>$/) || input.match(/^(\d+)$/);
        if (idMatch) {
          const usrId = idMatch[1];
          targetMember = await channel.guild.members.fetch(usrId).catch(() => null);
        }

        if (!targetMember) {
          const members = await channel.guild.members.fetch();
          targetMember = members.find(m =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            m.user.tag.toLowerCase() === input.toLowerCase() ||
            m.displayName.toLowerCase() === input.toLowerCase()
          ) || null;
        }

        if (!targetMember) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.memberNotFound', undefined, locale))]
          });
          return;
        }

        await this.voicePermissionService.applyPermission(channel, VoiceChannelPermission.ADD_MEMBER, [targetMember]);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed(t('common.success', undefined, locale), t('voice.messages.memberInvited', { username: targetMember.user.username }, locale))]
        });

        const managementMessage = (await channel.messages.fetch({ limit: 10 })).find(
          m => m.author.id === interaction.client.user?.id && m.embeds.length > 0 && m.embeds[0].title?.includes('Control Panel')
        );

        if (managementMessage) {
          await this.voiceChannelManagementService.updateManagementEmbed(managementMessage, channel.name, room.ownerId, room, locale);
        }
      } catch (error) {
        this.logger.error('Error inviting member', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }

  private async handleSetAdmin(interaction: ButtonInteraction, channel: VoiceChannel, room: any, locale: Locale): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_setadmin_modal_${channel.id}`)
      .setTitle(t('voice.modals.setAdminTitle', undefined, locale));

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel(t('voice.modals.setAdminLabel', undefined, locale))
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder(t('voice.modals.setAdminPlaceholder', undefined, locale))
      .setRequired(true);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(userInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    try {
      const modalSubmit = await interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === `vc_setadmin_modal_${channel.id}` });
      const input = modalSubmit.fields.getTextInputValue('user_identifier').trim();

      await modalSubmit.deferReply({ ephemeral: true });

      try {
        const { members } = await DiscordHelper.fetchMembersAndRoles(input, channel.guild);

        if (!members.length) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.memberNotFound', undefined, locale))]
          });
          return;
        }

        for (const member of members) {
          const guildMember = member as GuildMember;
          await this.voiceRoomService.addAdmin(channel.id, guildMember.id);
          await this.voicePermissionService.applyPermission(channel, VoiceChannelPermission.ADD_ADMIN, [guildMember]);
        }

        const memberNames = members.map(m => (m as GuildMember).user.username).join(', ');
        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed(t('common.success', undefined, locale), t('voice.messages.adminAdded', { username: memberNames }, locale))]
        });

        const managementMessage = (await channel.messages.fetch({ limit: 10 })).find(
          m => m.author.id === interaction.client.user?.id && m.embeds.length > 0 && m.embeds[0].title?.includes('Control Panel')
        );

        if (managementMessage) {
          const updatedRoom = await this.voiceRoomService.getRoom(channel.id);
          await this.voiceChannelManagementService.updateManagementEmbed(managementMessage, channel.name, room.ownerId, updatedRoom || room, locale);
        }
      } catch (error) {
        this.logger.error('Error setting admin', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }

  private async handleKick(interaction: ButtonInteraction, channel: VoiceChannel, room: any, locale: Locale): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_kick_modal_${channel.id}`)
      .setTitle(t('voice.modals.kickTitle', undefined, locale));

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel(t('voice.modals.kickLabel', undefined, locale))
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder(t('voice.modals.kickPlaceholder', undefined, locale))
      .setRequired(true);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(userInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    try {
      const modalSubmit = await interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === `vc_kick_modal_${channel.id}` });
      const input = modalSubmit.fields.getTextInputValue('user_identifier').trim();

      await modalSubmit.deferReply({ ephemeral: true });

      try {
        let targetMember: GuildMember | null = null;

        const idMatch = input.match(/^<@!?(\d+)>$/) || input.match(/^(\d+)$/);
        if (idMatch) {
          const usrId = idMatch[1];
          if (channel.members.has(usrId)) {
            targetMember = channel.members.get(usrId) || null;
          }
        }

        if (!targetMember) {
          targetMember = channel.members.find(m =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            m.user.tag.toLowerCase() === input.toLowerCase() ||
            m.displayName.toLowerCase() === input.toLowerCase()
          ) || null;
        }

        if (!targetMember) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('voice.messages.userNotFoundInChannel', undefined, locale))]
          });
          return;
        }

        if (targetMember.id === room.ownerId) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('voice.messages.cannotKickOwner', undefined, locale))]
          });
          return;
        }

        await targetMember.voice.disconnect('Kicked from voice channel');
        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed(t('common.success', undefined, locale), t('voice.messages.memberKicked', { username: targetMember.user.username }, locale))]
        });
      } catch (error) {
        this.logger.error('Error kicking member', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed(t('common.error', undefined, locale), t('errors.generic', undefined, locale))]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }
}
