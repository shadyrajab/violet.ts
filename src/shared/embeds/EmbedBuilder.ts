import { EmbedBuilder as DiscordEmbedBuilder, ColorResolvable } from 'discord.js';
import { Locale, t } from '../../core/i18n';

export class CustomEmbedBuilder {
  private readonly defaultColor: ColorResolvable = '#96879d';

  createSuccessEmbed(title: string, description: string): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(this.defaultColor)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
  }

  createErrorEmbed(title: string, description: string): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor('#ff0000')
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
  }

  createInfoEmbed(title: string, description: string): DiscordEmbedBuilder {
    return new DiscordEmbedBuilder()
      .setColor(this.defaultColor)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
  }

  createChannelManagementEmbed(
    channelName: string,
    ownerId: string,
    room?: {
      isLocked?: boolean;
      isHidden?: boolean;
      adminIds?: string[];
      allowedMembers?: string[];
      blockedMembers?: string[];
    },
    locale: Locale = 'en'
  ): DiscordEmbedBuilder {
    const locked = t('voice.channel.locked', undefined, locale);
    const unlocked = t('voice.channel.unlocked', undefined, locale);
    const hidden = t('voice.channel.hidden', undefined, locale);
    const visible = t('voice.channel.visible', undefined, locale);
    const none = t('common.none', undefined, locale);
    const more = t('common.more', undefined, locale);

    const embed = new DiscordEmbedBuilder()
      .setColor(this.defaultColor)
      .setTitle(`🎙️ ${t('voice.controlPanel.title', undefined, locale)}`)
      .setDescription(`**${t('voice.controlPanel.channelLabel', undefined, locale)}:** ${channelName}\n**${t('voice.controlPanel.ownerLabel', undefined, locale)}:** <@${ownerId}>`);

    if (room) {
      const statusEmoji = room.isLocked ? '🔒' : '🔓';
      const visibilityEmoji = room.isHidden ? '🙈' : '👁️';
      const statusText = `${statusEmoji} ${room.isLocked ? locked : unlocked} • ${visibilityEmoji} ${room.isHidden ? hidden : visible}`;

      embed.addFields({
        name: `📊 ${t('voice.controlPanel.statusLabel', undefined, locale)}`,
        value: statusText,
        inline: false
      });

      if (room.adminIds && room.adminIds.length > 0) {
        const adminList = room.adminIds.map(id => `<@${id}>`).join(', ');
        embed.addFields({
          name: `👑 ${t('voice.controlPanel.adminsLabel', undefined, locale)}`,
          value: adminList || none,
          inline: true
        });
      }

      if (room.allowedMembers && room.allowedMembers.length > 0) {
        const allowedList = room.allowedMembers.slice(0, 10).map(id => `<@${id}>`).join(', ');
        const moreCount = room.allowedMembers.length > 10 ? ` (+${room.allowedMembers.length - 10} ${more})` : '';
        embed.addFields({
          name: `✅ ${t('voice.controlPanel.allowedMembersLabel', undefined, locale)}`,
          value: (allowedList || none) + moreCount,
          inline: true
        });
      }

      if (room.blockedMembers && room.blockedMembers.length > 0) {
        const blockedList = room.blockedMembers.slice(0, 10).map(id => `<@${id}>`).join(', ');
        const moreCount = room.blockedMembers.length > 10 ? ` (+${room.blockedMembers.length - 10} ${more})` : '';
        embed.addFields({
          name: `🚫 ${t('voice.controlPanel.blockedMembersLabel', undefined, locale)}`,
          value: (blockedList || none) + moreCount,
          inline: true
        });
      }
    }

    embed.addFields({
      name: `💡 ${t('voice.controlPanel.quickActionsLabel', undefined, locale)}`,
      value: t('voice.controlPanel.quickActionsValue', undefined, locale),
      inline: false
    });

    return embed
      .setTimestamp()
      .setFooter({ text: t('voice.controlPanel.footer', undefined, locale) });
  }
}

export const embedBuilder = new CustomEmbedBuilder();
