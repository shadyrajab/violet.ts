import { GuildMember, Role, User, VoiceBasedChannel, VoiceChannel } from 'discord.js';
import { roomScheme } from '../database/schemes/roomScheme';
import { ChannelMethods } from '../structures/types';

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
    
        const permissions = {
            ADD_MEMBER: { CONNECT: true, VIEW_CHANNEL: true },
            ADD_ADMIN: {
                CONNECT: true,
                VIEW_CHANNEL: true,
                MANAGE_CHANNELS: true,
                MANAGE_ROLES: true,
                MUTE_MEMBERS: true,
                MOVE_MEMBERS: true,
                DEAFEN_MEMBERS: true,
            },
            BLOCK_MEMBER: { CONNECT: false, VIEW_CHANNEL: false },
            REMOVE_MEMBER: null,
            UNBLOCK_MEMBER: null,
            REMOVE_ADMIN: {
                MANAGE_CHANNELS: null,
                MANAGE_ROLES: null,
                MUTE_MEMBERS: null,
                MOVE_MEMBERS: null,
                DEAFEN_MEMBERS: null,
            },
            LOCK: { CONNECT: false },
            UNLOCK: { CONNECT: null },
            HIDE: { VIEW_CHANNEL: false },
            UNHIDE: { VIEW_CHANNEL: null },
        };
    
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
                if (method === 'REMOVE_MEMBER' || method === 'UNBLOCK_MEMBER') channel.permissionOverwrites.delete(member);
                channel.permissionOverwrites.edit(member, permissions[method]);
            }
        } else if (role) {
            channel.permissionOverwrites.edit(role, permissions[method]);
        } else if (name && method === 'RENAME') {
            await channel.edit({ name });
        }
    }    
}
