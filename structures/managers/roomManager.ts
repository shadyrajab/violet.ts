import {
  GuildMember, Role, User, VoiceBasedChannel, VoiceChannel,
} from 'discord.js';
import {roomScheme} from '../../database/schemes/roomScheme';
import {ChannelMethods} from '../structures/types';

interface ManageData {
    method: ChannelMethods,
    role?: Role,
    name?: string
    members?: Array <GuildMember | Role>
}

export class Room {
  public channel: VoiceChannel | VoiceBasedChannel;

  public user?: User;

  constructor(channel: VoiceChannel | VoiceBasedChannel, user?: User) {
    this.channel = channel;
    this.user = user;
  }

  async create() {
    const room = await roomScheme.create({
      channelId: this.channel.id,
      owner: this.user!.id,
      admins: [],
    });
    await room.save().catch((err: Error) => console.log(err));
  }

  async delete() {
    await roomScheme.deleteOne({channelId: this.channel.id});
  }

  async isOwner(member: User | GuildMember) {
    const room = await roomScheme.findOne({channelId: this.channel.id});
    const isOwner = (room.owner === member.id);
    return isOwner;
  }

  async addAdmin(user: User | GuildMember | Role) {
    const room = await roomScheme.findOne({channelId: this.channel.id});
    room.admins.push(user.id);
    await room.save().catch((err: Error) => console.log(err));
  }

  async removeAdmin(user: User | GuildMember | Role) {
    const room = await roomScheme.findOne({channelId: this.channel.id});
    room.admins.splice(room.admins.indexOf(user.id));
    await room.save().catch((err: Error) => console.log(err));
  }

  async isAdmin(member: User | GuildMember | Role) {
    const room = await roomScheme.findOne({channelId: this.channel.id});
    const isAdmin = (!!room.admins.find((admin: string) => admin === member.id));
    return isAdmin;
  }

  static async isRoom(channel: VoiceChannel | VoiceBasedChannel) {
    const room = await roomScheme.findOne({channelId: channel.id});
    const isRoom = !!(room);
    return isRoom;
  }

  static async checkRooms(user: User | GuildMember) {
    const rooms = await roomScheme.find({owner: user.id});
    let len = 1;
    rooms.forEach(() => {
      len += 1;
    });
    return len > 2;
  }

  async manage({
    method, role, name, members,
  }: ManageData) {
    const {channel} = this;
    if (members && members.length) {
      for (const member of members) {
        if (method === 'ADD_MEMBER') {
          channel.permissionOverwrites.edit(member, {
            CONNECT: true,
            VIEW_CHANNEL: true,
          });
        }
        if (method === 'ADD_ADMIN') {
          await this.addAdmin(member);
          channel.permissionOverwrites.edit(member, {
            CONNECT: true,
            VIEW_CHANNEL: true,
            MANAGE_CHANNELS: true,
            MANAGE_ROLES: true,
            MUTE_MEMBERS: true,
            MOVE_MEMBERS: true,
            DEAFEN_MEMBERS: true,
          });
        }
        if (method === 'BLOCK_MEMBER') {
          if (member instanceof GuildMember && member.voice && member.voice.channel === channel) member.edit({channel: null});
          if (member instanceof Role) {
            for (const channelMember of channel.members) {
              channelMember.reduce((_id, user) => {
                if (user instanceof GuildMember && user.roles.cache.get(member.id)) user.edit({channel: null});
                return user;
              });
            }
          }
          await this.removeAdmin(member);
          channel.permissionOverwrites.edit(member, {
            CONNECT: false,
            VIEW_CHANNEL: false,
          });
        }
        if (method === 'REMOVE_MEMBER' || method === 'UNBLOCK_MEMBER') channel.permissionOverwrites.delete(member);
        if (method === 'REMOVE_ADMIN') {
          await this.removeAdmin(member);
          channel.permissionOverwrites.edit(member, {
            MANAGE_CHANNELS: null,
            MANAGE_ROLES: null,
            MUTE_MEMBERS: null,
            MOVE_MEMBERS: null,
            DEAFEN_MEMBERS: null,
          });
        }
      }
    } else if (role) {
      if (method === 'LOCK') {
        channel.permissionOverwrites.edit(role, {
          CONNECT: false,
        });
      }
      if (method === 'UNLOCK') {
        channel.permissionOverwrites.edit(role, {
          CONNECT: null,
        });
      }
      if (method === 'HIDE') {
        channel.permissionOverwrites.edit(role, {
          VIEW_CHANNEL: false,
        });
      }
      if (method === 'UNHIDE') {
        channel.permissionOverwrites.edit(role, {
          VIEW_CHANNEL: null,
        });
      }
    } else if (name && method === 'RENAME') channel.edit({name});
  }
}
