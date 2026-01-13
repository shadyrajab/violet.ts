import { singleton, inject } from 'tsyringe';
import {
  VoiceChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message
} from 'discord.js';
import { VoicePermissionService } from './VoicePermissionService';
import { VoiceRoom } from '../entities/VoiceRoom';
import { Logger } from '../../../core/logger';
import { embedBuilder } from '../../../shared/embeds/EmbedBuilder';

@singleton()
export class VoiceChannelManagementService {
  constructor(
    @inject(VoicePermissionService) private voicePermissionService: VoicePermissionService,
    @inject(Logger) private logger: Logger
  ) {}

  async sendManagementEmbed(channel: VoiceChannel, ownerId: string, room?: VoiceRoom): Promise<Message | null> {
    try {
      const isLocked = this.voicePermissionService.isChannelLocked(channel);
      const isHidden = this.voicePermissionService.isChannelHidden(channel);
      const { allowedMembers, blockedMembers } = this.voicePermissionService.getChannelPermissions(channel);

      const embed = embedBuilder.createChannelManagementEmbed(channel.name, ownerId, {
        isLocked,
        isHidden,
        adminIds: room?.adminIds || [],
        allowedMembers,
        blockedMembers
      });

      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('vc_lock')
          .setLabel('Lock')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('vc_unlock')
          .setLabel('Unlock')
          .setEmoji('🔓')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('vc_hide')
          .setLabel('Hide')
          .setEmoji('🙈')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('vc_unhide')
          .setLabel('Unhide')
          .setEmoji('👁')
          .setStyle(ButtonStyle.Secondary)
      );

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('vc_rename')
          .setLabel('Rename')
          .setEmoji('✏️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('vc_invite')
          .setLabel('Invite')
          .setEmoji('➕')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('vc_kick')
          .setLabel('Kick')
          .setEmoji('👢')
          .setStyle(ButtonStyle.Danger)
      );

      const message = await channel.send({
        embeds: [embed],
        components: [row1, row2]
      });

      this.logger.info('Management embed sent', { channelId: channel.id, messageId: message.id });
      return message;
    } catch (error) {
      this.logger.error('Failed to send management embed', error as Error, { channelId: channel.id });
      return null;
    }
  }

  async updateManagementEmbed(message: Message, channelName: string, ownerId: string, room?: VoiceRoom): Promise<void> {
    try {
      if (!message.channel || message.channel.type !== 2) {
        this.logger.warn('Cannot update embed: channel not found or not voice channel');
        return;
      }

      const channel = message.channel as VoiceChannel;
      const isLocked = this.voicePermissionService.isChannelLocked(channel);
      const isHidden = this.voicePermissionService.isChannelHidden(channel);
      const { allowedMembers, blockedMembers } = this.voicePermissionService.getChannelPermissions(channel);

      const embed = embedBuilder.createChannelManagementEmbed(channelName, ownerId, {
        isLocked,
        isHidden,
        adminIds: room?.adminIds || [],
        allowedMembers,
        blockedMembers
      });

      await message.edit({ embeds: [embed] });

      this.logger.debug('Management embed updated', { messageId: message.id });
    } catch (error) {
      this.logger.error('Failed to update management embed', error as Error, { messageId: message.id });
    }
  }

  async removeManagementEmbed(message: Message): Promise<void> {
    try {
      await message.delete();
      this.logger.debug('Management embed removed', { messageId: message.id });
    } catch (error) {
      this.logger.error('Failed to remove management embed', error as Error, { messageId: message.id });
    }
  }
}
