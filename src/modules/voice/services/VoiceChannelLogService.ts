import { singleton, inject } from 'tsyringe';
import { VoiceChannel, GuildMember, EmbedBuilder } from 'discord.js';
import { Logger } from '../../../core/logger';

@singleton()
export class VoiceChannelLogService {
  constructor(
    @inject(Logger) private logger: Logger
  ) {}

  async logMemberJoin(channel: VoiceChannel, member: GuildMember): Promise<void> {
    try {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setDescription(`✅ <@${member.id}> joined the channel`)
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      this.logger.debug('Member join logged', {
        channelId: channel.id,
        memberId: member.id
      });
    } catch (error) {
      this.logger.error('Failed to log member join', error as Error, {
        channelId: channel.id,
        memberId: member.id
      });
    }
  }

  async logMemberLeave(channel: VoiceChannel, member: GuildMember): Promise<void> {
    try {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription(`❌ <@${member.id}> left the channel`)
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      this.logger.debug('Member leave logged', {
        channelId: channel.id,
        memberId: member.id
      });
    } catch (error) {
      this.logger.error('Failed to log member leave', error as Error, {
        channelId: channel.id,
        memberId: member.id
      });
    }
  }

  async logChannelAction(
    channel: VoiceChannel,
    action: string,
    executor: GuildMember,
    target?: GuildMember
  ): Promise<void> {
    try {
      let description = `🔧 <@${executor.id}> ${action}`;

      if (target) {
        description += ` <@${target.id}>`;
      }

      const embed = new EmbedBuilder()
        .setColor('#96879d')
        .setDescription(description)
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      this.logger.debug('Channel action logged', {
        channelId: channel.id,
        executorId: executor.id,
        action,
        targetId: target?.id
      });
    } catch (error) {
      this.logger.error('Failed to log channel action', error as Error, {
        channelId: channel.id,
        action
      });
    }
  }
}
