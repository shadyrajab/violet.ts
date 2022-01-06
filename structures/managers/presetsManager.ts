import {
  Client,
  Guild,
  GuildMember,
  PermissionOverwriteManager,
  User,
  Role,
} from 'discord.js';
import { presetScheme } from '../../database/schemes/presetScheme';
import { ChannelMethods } from '../structures/types';

interface ManageData {
    method: ChannelMethods,
    name?: string,
    member?: GuildMember | Role
}

export class PresetsManager {
  public user: User;

  public guild: Guild;

  public client: Client;

  constructor(user: User, guild: Guild, client: Client) {
    this.user = user;
    this.guild = guild;
    this.client = client;
  }

  async getPresets() {
    let userPresets; let
      userGuildPresets;
    const presets = await presetScheme.findOne({ userId: this.user.id });
    if (presets) userPresets = presets.presets;
    if (userPresets) userGuildPresets = userPresets[this.guild.id];
    return { presets, userPresets, userGuildPresets };
  }

  async getChannelName() {
    const { userGuildPresets } = await this.getPresets();
    if (!userGuildPresets) return;
    return userGuildPresets.name;
  }

  async isHided() {
    const { userGuildPresets } = await this.getPresets();
    if (!userGuildPresets) return;
    return userGuildPresets.hide;
  }

  async isLocked() {
    const { userGuildPresets } = await this.getPresets();
    if (!userGuildPresets) return;
    return userGuildPresets.lock;
  }

  async getUsersFrom(arrayName: 'members' | 'admins' | 'blocks') {
    const { presets, userPresets, userGuildPresets } = await this.getPresets();
    if (!userGuildPresets) return;
    const users = [];
    for (const userId of userGuildPresets[arrayName]) {
      const user = this.guild.roles.cache.get(userId) || await this.guild.members.fetch(userId);
      if (!user) {
        userGuildPresets[arrayName].splice(userGuildPresets[arrayName].indexOf(userId));
        await presets.updateOne({ presets: userPresets });
        await presets.save().catch((err: Error) => console.log(err));
      }
      users.push(user);
    }
    return users;
  }

  async setPresets(channelOverwrites: PermissionOverwriteManager, owner: GuildMember) {
    const { everyone } = this.guild.roles;
    const members = await this.getUsersFrom('members');
    const admins = await this.getUsersFrom('admins');
    const blocks = await this.getUsersFrom('blocks');
    channelOverwrites.edit(owner, {
      CONNECT: true,
      VIEW_CHANNEL: true,
      MANAGE_CHANNELS: true,
      MANAGE_ROLES: true,
      MUTE_MEMBERS: true,
      MOVE_MEMBERS: true,
      DEAFEN_MEMBERS: true,
    });
    if (await this.isHided()) {
      channelOverwrites.edit(everyone, {
        VIEW_CHANNEL: false,
      });
    }
    if (await this.isLocked()) {
      channelOverwrites.edit(everyone, {
        CONNECT: false,
      });
    }
    if (members && members.length) {
      for (const member of members) {
        channelOverwrites.edit(member, {
          CONNECT: true,
          VIEW_CHANNEL: true,
        });
      }
    }
    if (admins && admins.length) {
      for (const admin of admins) {
        channelOverwrites.edit(admin, {
          CONNECT: true,
          VIEW_CHANNEL: true,
          MANAGE_CHANNELS: true,
          MANAGE_ROLES: true,
          MUTE_MEMBERS: true,
          MOVE_MEMBERS: true,
          DEAFEN_MEMBERS: true,
        });
      }
    }
    if (blocks && blocks.length) {
      for (const block of blocks) {
        channelOverwrites.edit(block, {
          CONNECT: false,
          VIEW_CHANNEL: false,
        });
      }
    }
  }

  async create() {
    let { presets } = await this.getPresets();
    if (!presets) {
      presets = await presetScheme.create({
        userId: this.user.id,
        presets: {
          [this.guild.id]: {
            name: 'default',
            hide: false,
            lock: false,
            members: [],
            admins: [],
            blocks: [],
          },
        },
      });
    }
    const userPresets = presets.presets;
    const userGuildPresets = userPresets[this.guild.id];
    if (presets && !userGuildPresets) {
      userPresets[this.guild.id] = {
        name: 'default',
        hide: false,
        lock: false,
        members: [],
        admins: [],
        blocks: [],
      };
    }
    await presets.updateOne({ presets: userPresets });
    await presets.save().catch((err: Error) => console.log(err));
  }

  async delete() {
    await presetScheme.deleteOne({ userId: this.user.id });
  }

  async manage({ method, name, member }: ManageData) {
    const { presets, userPresets, userGuildPresets } = await this.getPresets();
    const channelMembers = userGuildPresets.members;
    const channelAdmins = userGuildPresets.admins;
    const channelBlocks = userGuildPresets.blocks;
    if (method === 'RENAME') userGuildPresets.name = name!;
    if (method === 'HIDE') userGuildPresets.hide = true;
    if (method === 'LOCK') userGuildPresets.lock = true;
    if (method === 'ADD_MEMBER') channelMembers.push(member!.id);
    if (method === 'ADD_ADMIN') channelAdmins.push(member!.id);
    if (method === 'BLOCK_MEMBER') channelBlocks.push(member!.id);
    if (method === 'REMOVE_MEMBER') channelMembers.splice(channelMembers.indexOf(member!.id));
    if (method === 'REMOVE_ADMIN') channelAdmins.splice(channelAdmins.indexOf(member!.id));
    if (method === 'UNBLOCK_MEMBER') channelBlocks.splice(channelBlocks.indexOf(member!.id));
    await presets.updateOne({ presets: userPresets });
    await presets.save().catch((err: Error) => console.log(err));
  }
}
