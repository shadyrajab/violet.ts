import { EmbedBuilder as DiscordEmbedBuilder, ColorResolvable } from 'discord.js';

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
    }
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setColor(this.defaultColor)
      .setTitle(`🎙️ Voice Channel Control Panel`)
      .setDescription(`**Channel:** ${channelName}\n**Owner:** <@${ownerId}>`);

    if (room) {
      const statusEmoji = room.isLocked ? '🔒' : '🔓';
      const visibilityEmoji = room.isHidden ? '🙈' : '👁️';
      const statusText = `${statusEmoji} ${room.isLocked ? 'Locked' : 'Unlocked'} • ${visibilityEmoji} ${room.isHidden ? 'Hidden' : 'Visible'}`;

      embed.addFields({
        name: '📊 Channel Status',
        value: statusText,
        inline: false
      });

      if (room.adminIds && room.adminIds.length > 0) {
        const adminList = room.adminIds.map(id => `<@${id}>`).join(', ');
        embed.addFields({
          name: '👑 Admins',
          value: adminList || 'None',
          inline: true
        });
      }

      if (room.allowedMembers && room.allowedMembers.length > 0) {
        const allowedList = room.allowedMembers.slice(0, 10).map(id => `<@${id}>`).join(', ');
        const moreCount = room.allowedMembers.length > 10 ? ` (+${room.allowedMembers.length - 10} more)` : '';
        embed.addFields({
          name: '✅ Allowed Members',
          value: (allowedList || 'None') + moreCount,
          inline: true
        });
      }

      if (room.blockedMembers && room.blockedMembers.length > 0) {
        const blockedList = room.blockedMembers.slice(0, 10).map(id => `<@${id}>`).join(', ');
        const moreCount = room.blockedMembers.length > 10 ? ` (+${room.blockedMembers.length - 10} more)` : '';
        embed.addFields({
          name: '🚫 Blocked Members',
          value: (blockedList || 'None') + moreCount,
          inline: true
        });
      }
    }

    embed.addFields({
      name: '💡 Quick Actions',
      value: 'Use the buttons below to manage your channel, or use `/help` for all commands',
      inline: false
    });

    return embed
      .setTimestamp()
      .setFooter({ text: 'Violet Bot - Auto-deletes after 10s of inactivity' });
  }
}

export const embedBuilder = new CustomEmbedBuilder();
