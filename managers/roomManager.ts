import { GuildMember, Role, User, VoiceBasedChannel, VoiceChannel } from 'discord.js';
import { roomScheme } from '../database/schemes/roomScheme';
import { ChannelMethods, Permissions } from '../structures/types';

interface ManageData {
    method: ChannelMethods;
    role?: Role;
    name?: string;
    members?: Array<GuildMember | Role>;
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
        await roomScheme.deleteOne({ channelId: this.channel.id });
    }

    async isOwner(member: User | GuildMember) {
        const room = await roomScheme.findOne({ channelId: this.channel.id });
        return !!room && room.owner === member.id;
    }

    async addAdmin(user: User | GuildMember | Role) {
        const room = await roomScheme.findOne({ channelId: this.channel.id });
        if (room) {
            room.admins.push(user.id);
            await room.save().catch((err: Error) => console.log(err));
        }
    }

    async removeAdmin(user: User | GuildMember | Role) {
        const room = await roomScheme.findOne({ channelId: this.channel.id });
        if (room) {
            room.admins = room.admins.filter((admin: string) => admin !== user.id);
            await room.save().catch((err: Error) => console.log(err));
        }
    }

    async isAdmin(member: User | GuildMember | Role) {
        const room = await roomScheme.findOne({ channelId: this.channel.id });
        return !!room && !!room.admins.find((admin: string) => admin === member.id);
    }

    static async isRoom(channel: VoiceChannel | VoiceBasedChannel) {
        const room = await roomScheme.findOne({ channelId: channel.id });
        return !!room;
    }

    static async checkRooms(user: User | GuildMember) {
        const rooms = await roomScheme.find({ owner: user.id });
        return rooms.length > 2;
    }

    async manage({ method, role, name, members }: ManageData) {
        const { channel } = this;
    
        const permissions: Permissions = {
            ADD_MEMBER: { Connect: true, ViewChannel: true },
            ADD_ADMIN: {
                Connect: true,
                ViewChannel: true,
                ManageChannels: true,
                ManageRoles: true,
                MuteMembers: true,
                MoveMembers: true,
                DeafenMembers: true,
            },
            BLOCK_MEMBER: { Connect: false, ViewChannel: false },
            REMOVE_MEMBER: { Connect: null, ViewChannel: null },
            UNBLOCK_MEMBER: { Connect: null, ViewChannel: null },
            RENAME: null,
            REMOVE_ADMIN: {
                ManageChannels: null,
                ManageRoles: null,
                MuteMembers: null,
                MoveMembers: null,
                DeafenMembers: null,
            },
            LOCK: { Connect: false },
            UNLOCK: { Connect: null },
            HIDE: { ViewChannel: false },
            UNHIDE: { ViewChannel: null },
        }
    
        if (members && members.length) {
            for (const member of members) {
                if (method === 'ADD_ADMIN') await this.addAdmin(member);
                if (method === 'BLOCK_MEMBER') {
                    if (member instanceof GuildMember && member.voice?.channel === channel) await member.edit({ channel: null });
                    if (member instanceof Role) {
                        channel.members.forEach(channelMember => {
                            if (channelMember instanceof GuildMember && channelMember.roles.cache.get(member.id)) channelMember.edit({ channel: null });
                        });
                    }
                    await this.removeAdmin(member);
                }
                if (method === 'REMOVE_MEMBER' || method === 'UNBLOCK_MEMBER') return channel.permissionOverwrites.delete(member);
                channel.permissionOverwrites.edit(member, permissions[method]);
            }
        } else if (role) {
            channel.permissionOverwrites.edit(role, permissions[method]);
        } else if (name && method === 'RENAME') {
            await channel.edit({ name });
        }
    }    
}
