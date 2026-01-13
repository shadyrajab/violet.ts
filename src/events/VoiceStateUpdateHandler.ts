import { injectable, inject } from 'tsyringe';
import { Client, ChannelType, VoiceState, DiscordAPIError } from 'discord.js';
import { VoiceRoomService } from '../modules/voice/services/VoiceRoomService';
import { VoiceProfileService } from '../modules/voice/services/VoiceProfileService';
import { ServerService } from '../modules/servers/services/ServerService';
import { PresetService } from '../modules/presets/services/PresetService';
import { VoicePermissionService } from '../modules/voice/services/VoicePermissionService';
import { VoiceChannelManagementService } from '../modules/voice/services/VoiceChannelManagementService';
import { UserService } from '../modules/users/services/UserService';
import { Logger } from '../core/logger';
import { simultaneousChannel } from '../shared/translations/temporarychannels/globalMessages';
import { permissionsRemoved } from '../shared/translations/globalMessages';
import { embedBuilder } from '../shared/embeds/EmbedBuilder';

@injectable()
export class VoiceStateUpdateHandler {
  private deletionTimers: Map<string, NodeJS.Timeout> = new Map();
  private client!: Client;

  constructor(
    @inject(VoiceRoomService) private voiceRoomService: VoiceRoomService,
    @inject(VoiceProfileService) private voiceProfileService: VoiceProfileService,
    @inject(ServerService) private serverService: ServerService,
    @inject(PresetService) private presetService: PresetService,
    @inject(VoicePermissionService) private voicePermissionService: VoicePermissionService,
    @inject(VoiceChannelManagementService) private voiceChannelManagementService: VoiceChannelManagementService,
    @inject(UserService) private userService: UserService,
    @inject(Logger) private logger: Logger
  ) {}

  setup(client: Client): void {
    this.client = client;

    client.on('voiceStateUpdate', async (_oldState: VoiceState, newState: VoiceState) => {
      await this.handleVoiceStateUpdate(_oldState, newState);
    });

    client.once('ready', async () => {
      await this.cleanupInactiveChannels(client);
    });

    this.logger.info('VoiceStateUpdateHandler registered');
  }

  private async cleanupInactiveChannels(client: Client): Promise<void> {
    try {
      this.logger.info('Starting cleanup of inactive channels...');

      for (const [, guild] of client.guilds.cache) {
        const profiles = await this.voiceProfileService.getGuildProfiles(guild.id);

        for (const profile of profiles) {
          if (!profile.isActive) continue;

          const category = await guild.channels.fetch(profile.categoryId).catch(() => null);
          if (!category || category.type !== ChannelType.GuildCategory) continue;

          const voiceChannels = Array.from(category.children.cache.values()).filter(
            channel => channel.type === ChannelType.GuildVoice
          );

          for (const voiceChannel of voiceChannels) {
            if (voiceChannel.id === profile.joinChannelId) continue;

            const isRoom = await this.voiceRoomService.isRoom(voiceChannel.id);
            if (!isRoom) continue;

            if (voiceChannel.type === ChannelType.GuildVoice && voiceChannel.members.size === 0) {
              setTimeout(async () => {
                try {
                  const channel = await guild.channels.fetch(voiceChannel.id).catch(() => null);
                  if (channel && channel.type === ChannelType.GuildVoice && channel.members.size === 0) {
                    await channel.delete('Cleanup - Empty channel after restart');
                    await this.voiceRoomService.deleteRoom(voiceChannel.id);
                    this.logger.info('Inactive channel cleaned up', { channelId: voiceChannel.id });
                  }
                } catch (error) {
                  await this.voiceRoomService.deleteRoom(voiceChannel.id).catch(() => {});
                  this.logger.debug('Channel cleanup error handled', { channelId: voiceChannel.id });
                }
              }, 10000);
            }
          }
        }
      }

      this.logger.info('Cleanup check completed');
    } catch (error) {
      this.logger.error('Error during cleanup', error as Error);
    }
  }

  private async handleVoiceStateUpdate(_oldState: VoiceState, newState: VoiceState): Promise<void> {
    try {
      const guild = newState.guild || _oldState.guild;
      const member = newState.member || _oldState.member;
      if (!guild || !member) return;

      const user = member.user;
      const channel = newState.channel;

      if (channel) {
        const profile = await this.voiceProfileService.getProfileByJoinChannel(channel.id);

        if (profile) {
          const userLanguage = await this.userService.getUserLanguage(user.id);
          const serverLanguage = await this.serverService.getServerLanguage(guild.id);
          const language = userLanguage !== 'english' ? userLanguage : serverLanguage;
          const canCreate = await this.voiceRoomService.canUserCreateRoom(user.id);

          if (!canCreate) {
            try {
              await member.send(`${member}, ${simultaneousChannel(language)}`);
            } catch {}
            await member.edit({ channel: null });
            return;
          }

          const preset = await this.presetService.getPreset(user.id, guild.id);
          let channelName = preset?.name;
          channelName = (!channelName || channelName === 'default') ? `${user.username}'s channel` : channelName;

          try {
            const categoryChannel = await guild.channels.fetch(profile.categoryId);
            if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
              this.logger.warn('Category channel not found or invalid', { categoryId: profile.categoryId });
              return;
            }

            const tempChannel = await guild.channels.create({
              name: channelName,
              type: ChannelType.GuildVoice,
              parent: profile.categoryId,
              reason: `New tr channel to ${user.tag}`,
            });

            if (preset) {
              await this.voicePermissionService.applyPresetPermissions(
                tempChannel,
                preset.memberIds,
                preset.adminIds,
                preset.blockedIds,
                preset.hide,
                preset.lock
              );
            }

            try {
              const room = await this.voiceRoomService.createRoom(tempChannel.id, user.id, preset?.adminIds || []);

              await this.voiceChannelManagementService.sendManagementEmbed(tempChannel, user.id, room);

              await member.edit({ channel: tempChannel });
            } catch (roomError) {
              this.logger.warn('Failed to create room in database, deleting channel', {
                channelId: tempChannel.id,
                error: (roomError as Error).message
              });

              try {
                await tempChannel.delete('Failed to register room in database');
              } catch (deleteError) {
                this.logger.error('Failed to delete channel after room creation error', deleteError as Error, {
                  channelId: tempChannel.id
                });
              }

              if ((roomError as Error).message.includes('maximum room limit')) {
                try {
                  await member.send(`${member}, ${simultaneousChannel(language)}`);
                } catch {}
              }

              return;
            }
          } catch (err) {
            if (err instanceof DiscordAPIError && err.message === 'Missing Permissions') {
              try {
                await member.send(permissionsRemoved(language));
              } catch {}
            }
            this.logger.error('Failed to create temporary channel', err as Error, {
              userId: user.id,
              guildId: guild.id
            });
          }
        }
      }

      const allProfiles = await this.voiceProfileService.getGuildProfiles(guild.id);
      const joinChannelIds = allProfiles.filter(p => p.isActive).map(p => p.joinChannelId);

      this.logger.debug('Voice state update', {
        oldChannelId: _oldState.channelId,
        newChannelId: newState.channelId,
        userId: user.id
      });

      if (_oldState.channelId && !joinChannelIds.includes(_oldState.channelId) && _oldState.channelId !== newState.channelId) {
        this.logger.debug('User left a channel, checking if it should be deleted', {
          channelId: _oldState.channelId
        });

        const isRoom = await this.voiceRoomService.isRoom(_oldState.channelId);

        this.logger.debug('Is room check result', {
          channelId: _oldState.channelId,
          isRoom
        });

        if (isRoom) {
          const oldChannel = await guild.channels.fetch(_oldState.channelId).catch(() => null);

          if (oldChannel && oldChannel.type === ChannelType.GuildVoice) {
            this.logger.debug('Old channel found', {
              channelId: _oldState.channelId,
              channelName: oldChannel.name,
              memberCount: oldChannel.members.size
            });

            if (oldChannel.members.size === 0) {
              this.logger.info('Scheduling deletion for empty channel', {
                channelId: _oldState.channelId,
                channelName: oldChannel.name
              });
              this.scheduleChannelDeletion(_oldState.channelId, guild.id);
            } else {
              this.logger.debug('Channel still has members, not scheduling deletion', {
                channelId: _oldState.channelId,
                memberCount: oldChannel.members.size
              });
            }
          } else {
            this.logger.debug('Old channel not found or not voice channel', {
              channelId: _oldState.channelId
            });
          }
        }
      }

      if (newState.channelId && !joinChannelIds.includes(newState.channelId)) {
        const isRoom = await this.voiceRoomService.isRoom(newState.channelId);

        if (isRoom) {
          if (this.deletionTimers.has(newState.channelId)) {
            this.logger.debug('Cancelling deletion for re-occupied channel', { channelId: newState.channelId });
            this.cancelChannelDeletion(newState.channelId);
          }

          if (newState.channelId !== _oldState.channelId) {
            const channel = await guild.channels.fetch(newState.channelId).catch(() => null);
            if (channel && channel.type === ChannelType.GuildVoice) {
              await channel.send({
                embeds: [embedBuilder.createInfoEmbed(
                  'Member Joined',
                  `**${user.username}** joined the channel`
                )]
              }).catch(() => {});
            }
          }
        }
      }

      if (_oldState.channelId && !joinChannelIds.includes(_oldState.channelId) && _oldState.channelId !== newState.channelId) {
        const isRoom = await this.voiceRoomService.isRoom(_oldState.channelId);

        if (isRoom) {
          const channel = await guild.channels.fetch(_oldState.channelId).catch(() => null);
          if (channel && channel.type === ChannelType.GuildVoice) {
            await channel.send({
              embeds: [embedBuilder.createInfoEmbed(
                'Member Left',
                `**${user.username}** left the channel`
              )]
            }).catch(() => {});
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in voiceStateUpdate handler', error as Error);
    }
  }

  private scheduleChannelDeletion(channelId: string, guildId: string): void {
    if (this.deletionTimers.has(channelId)) {
      clearTimeout(this.deletionTimers.get(channelId)!);
      this.logger.debug('Clearing existing deletion timer', { channelId });
    }

    const timer = setTimeout(async () => {
      this.logger.debug('Deletion timer fired, checking channel', { channelId });
      try {
        const guild = await this.client.guilds.fetch(guildId).catch(() => null);
        if (!guild) {
          this.logger.debug('Guild not found', { guildId });
          return;
        }

        const channel = await guild.channels.fetch(channelId).catch(() => null);

        if (!channel || channel.type !== ChannelType.GuildVoice) {
          this.logger.debug('Channel not found or not voice channel, cleaning database', { channelId });
          await this.voiceRoomService.deleteRoom(channelId);
          this.deletionTimers.delete(channelId);
          return;
        }

        this.logger.debug('Channel found, checking members', {
          channelId,
          memberCount: channel.members.size
        });

        if (channel.members.size === 0) {
          this.logger.info('Deleting empty voice channel', {
            channelId,
            channelName: channel.name
          });
          await channel.delete('Inactivity - 10s without members');
          await this.voiceRoomService.deleteRoom(channelId);
          this.logger.info('Empty voice channel deleted successfully', { channelId });
        } else {
          this.logger.debug('Channel has members, skipping deletion', {
            channelId,
            memberCount: channel.members.size
          });
        }

        this.deletionTimers.delete(channelId);
      } catch (error) {
        this.logger.error('Error during channel deletion', error as Error, { channelId });
        await this.voiceRoomService.deleteRoom(channelId).catch(() => {});
        this.deletionTimers.delete(channelId);
      }
    }, 10000);

    this.deletionTimers.set(channelId, timer);
    this.logger.info('Channel deletion scheduled for 10 seconds', { channelId });
  }

  private cancelChannelDeletion(channelId: string): void {
    const timer = this.deletionTimers.get(channelId);
    if (timer) {
      clearTimeout(timer);
      this.deletionTimers.delete(channelId);
      this.logger.debug('Channel deletion cancelled', { channelId });
    }
  }
}
