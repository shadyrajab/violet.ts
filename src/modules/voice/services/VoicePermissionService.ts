import { singleton, inject } from 'tsyringe';
import {
  VoiceChannel,
  GuildMember,
  Role,
  PermissionOverwriteOptions,
} from 'discord.js';
import { VoiceChannelPermission } from '../../../core/types';
import { Logger } from '../../../core/logger';
import { DiscordApiError } from '../../../core/errors';

type PermissionTarget = GuildMember | Role;

@singleton()
export class VoicePermissionService {
  private readonly permissionMappings: Record<VoiceChannelPermission, PermissionOverwriteOptions | null> = {
    [VoiceChannelPermission.ADD_MEMBER]: {
      Connect: true,
      ViewChannel: true
    },
    [VoiceChannelPermission.ADD_ADMIN]: {
      Connect: true,
      ViewChannel: true,
      ManageChannels: true,
      ManageRoles: true,
      MuteMembers: true,
      MoveMembers: true,
      DeafenMembers: true
    },
    [VoiceChannelPermission.BLOCK_MEMBER]: {
      Connect: false,
      ViewChannel: false
    },
    [VoiceChannelPermission.REMOVE_MEMBER]: {
      Connect: null,
      ViewChannel: null
    },
    [VoiceChannelPermission.UNBLOCK_MEMBER]: {
      Connect: null,
      ViewChannel: null
    },
    [VoiceChannelPermission.REMOVE_ADMIN]: {
      ManageChannels: null,
      ManageRoles: null,
      MuteMembers: null,
      MoveMembers: null,
      DeafenMembers: null
    },
    [VoiceChannelPermission.LOCK]: {
      Connect: false
    },
    [VoiceChannelPermission.UNLOCK]: {
      Connect: null
    },
    [VoiceChannelPermission.HIDE]: {
      ViewChannel: false
    },
    [VoiceChannelPermission.UNHIDE]: {
      ViewChannel: null
    },
    [VoiceChannelPermission.RENAME]: null
  };

  constructor(
    @inject(Logger) private logger: Logger
  ) {}

  async applyPermission(
    channel: VoiceChannel,
    operation: VoiceChannelPermission,
    targets?: PermissionTarget[],
    newName?: string
  ): Promise<void> {
    try {
      if (operation === VoiceChannelPermission.RENAME && newName) {
        await this.renameChannel(channel, newName);
        return;
      }

      const permissions = this.permissionMappings[operation];

      if (!permissions) {
        this.logger.warn('No permissions defined for operation', { operation });
        return;
      }

      if (!targets || targets.length === 0) {
        await this.applyToEveryone(channel, permissions);
        return;
      }

      for (const target of targets) {
        if (operation === VoiceChannelPermission.BLOCK_MEMBER && target instanceof GuildMember) {
          await this.kickFromChannel(target, channel);
        }

        if (operation === VoiceChannelPermission.REMOVE_MEMBER || operation === VoiceChannelPermission.UNBLOCK_MEMBER) {
          await this.removePermissionOverwrite(channel, target);
        } else {
          await this.setPermissionOverwrite(channel, target, permissions);
        }
      }

      this.logger.info('Permissions applied successfully', {
        channelId: channel.id,
        operation,
        targetCount: targets.length
      });
    } catch (error) {
      this.logger.error('Failed to apply permissions', error as Error, {
        channelId: channel.id,
        operation
      });
      throw new DiscordApiError((error as Error).message);
    }
  }

  private async setPermissionOverwrite(
    channel: VoiceChannel,
    target: PermissionTarget,
    permissions: PermissionOverwriteOptions
  ): Promise<void> {
    await channel.permissionOverwrites.edit(target, permissions);
  }

  private async removePermissionOverwrite(
    channel: VoiceChannel,
    target: PermissionTarget
  ): Promise<void> {
    await channel.permissionOverwrites.delete(target);
  }

  private async applyToEveryone(
    channel: VoiceChannel,
    permissions: PermissionOverwriteOptions
  ): Promise<void> {
    const everyoneRole = channel.guild.roles.everyone;
    await this.setPermissionOverwrite(channel, everyoneRole, permissions);
  }

  private async renameChannel(channel: VoiceChannel, newName: string): Promise<void> {
    await channel.edit({ name: newName });
    this.logger.info('Channel renamed', { channelId: channel.id, newName });
  }

  private async kickFromChannel(member: GuildMember, channel: VoiceChannel): Promise<void> {
    if (member.voice.channel?.id === channel.id) {
      await member.voice.disconnect();
      this.logger.info('Member kicked from channel', {
        memberId: member.id,
        channelId: channel.id
      });
    }
  }

  async kickMembersWithRole(channel: VoiceChannel, role: Role): Promise<void> {
    try {
      const members = channel.members.filter(member => member.roles.cache.has(role.id));

      for (const member of members.values()) {
        await this.kickFromChannel(member, channel);
      }

      this.logger.info('Members with role kicked from channel', {
        channelId: channel.id,
        roleId: role.id,
        count: members.size
      });
    } catch (error) {
      this.logger.error('Failed to kick members with role', error as Error, {
        channelId: channel.id,
        roleId: role.id
      });
      throw new DiscordApiError((error as Error).message);
    }
  }

  async applyPresetPermissions(
    channel: VoiceChannel,
    memberIds: string[],
    adminIds: string[],
    blockedIds: string[],
    hide: boolean,
    lock: boolean
  ): Promise<void> {
    try {
      const guild = channel.guild;

      const allowedMembers = await Promise.all(
        memberIds.map(id => guild.members.fetch(id).catch(() => null))
      );
      const adminMembers = await Promise.all(
        adminIds.map(id => guild.members.fetch(id).catch(() => null))
      );
      const blockedMembers = await Promise.all(
        blockedIds.map(id => guild.members.fetch(id).catch(() => null))
      );

      const validAllowed = allowedMembers.filter((m): m is GuildMember => m !== null);
      const validAdmins = adminMembers.filter((m): m is GuildMember => m !== null);
      const validBlocked = blockedMembers.filter((m): m is GuildMember => m !== null);

      if (validAllowed.length > 0) {
        await this.applyPermission(channel, VoiceChannelPermission.ADD_MEMBER, validAllowed);
      }

      if (validAdmins.length > 0) {
        await this.applyPermission(channel, VoiceChannelPermission.ADD_ADMIN, validAdmins);
      }

      if (validBlocked.length > 0) {
        await this.applyPermission(channel, VoiceChannelPermission.BLOCK_MEMBER, validBlocked);
      }

      if (hide) {
        await this.applyPermission(channel, VoiceChannelPermission.HIDE);
      }

      if (lock) {
        await this.applyPermission(channel, VoiceChannelPermission.LOCK);
      }

      this.logger.info('Preset permissions applied', { channelId: channel.id });
    } catch (error) {
      this.logger.error('Failed to apply preset permissions', error as Error, {
        channelId: channel.id
      });
      throw error;
    }
  }

  async lockChannel(channel: VoiceChannel): Promise<void> {
    await this.applyPermission(channel, VoiceChannelPermission.LOCK);
  }

  async unlockChannel(channel: VoiceChannel): Promise<void> {
    await this.applyPermission(channel, VoiceChannelPermission.UNLOCK);
  }

  async hideChannel(channel: VoiceChannel): Promise<void> {
    await this.applyPermission(channel, VoiceChannelPermission.HIDE);
  }

  async unhideChannel(channel: VoiceChannel): Promise<void> {
    await this.applyPermission(channel, VoiceChannelPermission.UNHIDE);
  }

  isChannelLocked(channel: VoiceChannel): boolean {
    const everyoneRole = channel.guild.roles.everyone;
    const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
    return permissions?.deny.has('Connect') ?? false;
  }

  isChannelHidden(channel: VoiceChannel): boolean {
    const everyoneRole = channel.guild.roles.everyone;
    const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
    return permissions?.deny.has('ViewChannel') ?? false;
  }

  getChannelPermissions(channel: VoiceChannel): {
    allowedMembers: string[];
    blockedMembers: string[];
  } {
    const allowed: string[] = [];
    const blocked: string[] = [];

    for (const [id, overwrite] of channel.permissionOverwrites.cache) {
      if (id === channel.guild.roles.everyone.id) continue;

      if (overwrite.type === 1) {
        const canConnect = overwrite.allow.has('Connect');
        const cannotConnect = overwrite.deny.has('Connect');

        if (canConnect) {
          allowed.push(id);
        } else if (cannotConnect) {
          blocked.push(id);
        }
      }
    }

    return { allowedMembers: allowed, blockedMembers: blocked };
  }
}
