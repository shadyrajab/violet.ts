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

@injectable()
export class VoiceButtonHandler {
  constructor(
    @inject(VoiceRoomService) private voiceRoomService: VoiceRoomService,
    @inject(VoicePermissionService) private voicePermissionService: VoicePermissionService,
    @inject(VoiceChannelManagementService) private voiceChannelManagementService: VoiceChannelManagementService,
    @inject(Logger) private logger: Logger
  ) {}

  async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    try {
      if (!interaction.customId.startsWith('vc_')) return;

      const member = interaction.member;
      if (!member || !interaction.guild) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed('Error', 'Could not find member or guild')], ephemeral: true });
        return;
      }

      const voiceChannel = interaction.channel;
      if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed('Error', 'This can only be used in voice channels')], ephemeral: true });
        return;
      }

      const room = await this.voiceRoomService.getRoom(voiceChannel.id);
      if (!room) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed('Error', 'This is not a temporary voice channel')], ephemeral: true });
        return;
      }

      const userId = typeof member.user === 'object' ? member.user.id : interaction.user.id;

      if (!room.hasPermission(userId)) {
        await interaction.reply({ embeds: [embedBuilder.createErrorEmbed('Permission Denied', 'Only the owner or admins can manage this channel')], ephemeral: true });
        return;
      }

      switch (interaction.customId) {
        case 'vc_lock':
          await interaction.deferReply({ ephemeral: true });
          await this.handleLock(interaction, voiceChannel);
          break;
        case 'vc_unlock':
          await interaction.deferReply({ ephemeral: true });
          await this.handleUnlock(interaction, voiceChannel);
          break;
        case 'vc_hide':
          await interaction.deferReply({ ephemeral: true });
          await this.handleHide(interaction, voiceChannel);
          break;
        case 'vc_unhide':
          await interaction.deferReply({ ephemeral: true });
          await this.handleUnhide(interaction, voiceChannel);
          break;
        case 'vc_rename':
          await this.handleRename(interaction, voiceChannel as VoiceChannel, room);
          return;
        case 'vc_invite':
          await this.handleInvite(interaction, voiceChannel as VoiceChannel, room);
          return;
        case 'vc_kick':
          await this.handleKick(interaction, voiceChannel as VoiceChannel, room);
          return;
        default:
          await interaction.reply({ embeds: [embedBuilder.createErrorEmbed('Error', 'Unknown button action')], ephemeral: true });
      }

      const message = await voiceChannel.messages.fetch(interaction.message.id).catch(() => null);
      if (message) {
        await this.voiceChannelManagementService.updateManagementEmbed(
          message,
          voiceChannel.name,
          room.ownerId,
          room
        );
      }
    } catch (error) {
      this.logger.error('Error handling button interaction', error as Error, {
        customId: interaction.customId,
        userId: interaction.user.id
      });
      await interaction.editReply({ embeds: [embedBuilder.createErrorEmbed('Error', 'An error occurred while processing your request')] }).catch(() => {});
    }
  }

  private async handleLock(interaction: ButtonInteraction, channel: any): Promise<void> {
    await this.voicePermissionService.lockChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed('Channel Locked', 'The channel has been locked')] });
  }

  private async handleUnlock(interaction: ButtonInteraction, channel: any): Promise<void> {
    await this.voicePermissionService.unlockChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed('Channel Unlocked', 'The channel has been unlocked')] });
  }

  private async handleHide(interaction: ButtonInteraction, channel: any): Promise<void> {
    await this.voicePermissionService.hideChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed('Channel Hidden', 'The channel has been hidden from the channel list')] });
  }

  private async handleUnhide(interaction: ButtonInteraction, channel: any): Promise<void> {
    await this.voicePermissionService.unhideChannel(channel);
    await interaction.editReply({ embeds: [embedBuilder.createSuccessEmbed('Channel Visible', 'The channel is now visible in the channel list')] });
  }

  private async handleRename(interaction: ButtonInteraction, channel: VoiceChannel, room: any): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_rename_modal_${channel.id}`)
      .setTitle('Rename Voice Channel');

    const nameInput = new TextInputBuilder()
      .setCustomId('channel_name')
      .setLabel('New Channel Name')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder('Enter new channel name')
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
          embeds: [embedBuilder.createSuccessEmbed('Channel Renamed', `Channel renamed to **${newName}**`)]
        });

        await channel.send({
          embeds: [embedBuilder.createSuccessEmbed('Channel Renamed', `Channel renamed to **${newName}**`)]
        });

        const managementMessage = (await channel.messages.fetch({ limit: 10 })).find(
          m => m.author.id === interaction.client.user?.id && m.embeds.length > 0 && m.embeds[0].title?.includes('Control Panel')
        );

        if (managementMessage) {
          await this.voiceChannelManagementService.updateManagementEmbed(managementMessage, newName, room.ownerId, room);
        }
      } catch (error) {
        this.logger.error('Error renaming channel', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed('Error', 'Failed to rename the channel')]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }

  private async handleInvite(interaction: ButtonInteraction, channel: VoiceChannel, room: any): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_invite_modal_${channel.id}`)
      .setTitle('Invite Member');

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel('User ID, Username, or @mention')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder('Enter user ID, username, or @mention')
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
          const userId = idMatch[1];
          targetMember = await channel.guild.members.fetch(userId).catch(() => null);
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
            embeds: [embedBuilder.createErrorEmbed('User Not Found', 'Could not find the specified user')]
          });
          return;
        }

        await this.voicePermissionService.applyPermission(channel, VoiceChannelPermission.ADD_MEMBER, [targetMember]);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed('Member Invited', `**${targetMember.user.username}** has been invited to the channel`)]
        });

        await channel.send({
          embeds: [embedBuilder.createSuccessEmbed('Member Invited', `**${targetMember.user.username}** has been invited to the channel`)]
        });

        const managementMessage = (await channel.messages.fetch({ limit: 10 })).find(
          m => m.author.id === interaction.client.user?.id && m.embeds.length > 0 && m.embeds[0].title?.includes('Control Panel')
        );

        if (managementMessage) {
          await this.voiceChannelManagementService.updateManagementEmbed(managementMessage, channel.name, room.ownerId, room);
        }
      } catch (error) {
        this.logger.error('Error inviting member', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed('Error', 'Failed to invite the member')]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }

  private async handleKick(interaction: ButtonInteraction, channel: VoiceChannel, room: any): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId(`vc_kick_modal_${channel.id}`)
      .setTitle('Kick Member');

    const userInput = new TextInputBuilder()
      .setCustomId('user_identifier')
      .setLabel('User ID, Username, or @mention')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setPlaceholder('Enter user ID, username, or @mention')
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
          const userId = idMatch[1];
          if (channel.members.has(userId)) {
            targetMember = channel.members.get(userId) || null;
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
            embeds: [embedBuilder.createErrorEmbed('User Not Found', 'Could not find the specified user in this channel')]
          });
          return;
        }

        if (targetMember.id === room.ownerId) {
          await modalSubmit.editReply({
            embeds: [embedBuilder.createErrorEmbed('Cannot Kick Owner', 'You cannot kick the channel owner')]
          });
          return;
        }

        await targetMember.voice.disconnect('Kicked from voice channel');
        await modalSubmit.editReply({
          embeds: [embedBuilder.createSuccessEmbed('Member Kicked', `**${targetMember.user.username}** has been kicked from the channel`)]
        });

        await channel.send({
          embeds: [embedBuilder.createSuccessEmbed('Member Kicked', `**${targetMember.user.username}** has been kicked from the channel`)]
        });
      } catch (error) {
        this.logger.error('Error kicking member', error as Error);
        await modalSubmit.editReply({
          embeds: [embedBuilder.createErrorEmbed('Error', 'Failed to kick the member')]
        });
      }
    } catch (error) {
      this.logger.debug('Modal submit timeout or cancelled');
    }
  }
}
