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

        if (members && members.length) {
            for (const member of members) {
                if (method === 'ADD_ADMIN') {
                    await this.addAdmin(member);
                    channel.permissionOverwrites.edit(member, {
                        Connect: true,
                        ViewAuditLog: true,
                        ManageChannels: true,
                        ManageRoles: true,
                        MuteMembers: true,
                        MoveMembers: true,
                        DeafenMembers: true,
                    });
                } else if (method === 'BLOCK_MEMBER') {
                    // Bloquear membro...
                } else if (method === 'REMOVE_MEMBER' || method === 'UNBLOCK_MEMBER') {
                    channel.permissionOverwrites.delete(member);
                } else if (method === 'REMOVE_ADMIN') {
                    // Remover admin...
                }
            }
        } else if (role) {
            if (method === 'LOCK') {
                // Bloquear...
            } else if (method === 'UNLOCK') {
                // Desbloquear...
            } else if (method === 'HIDE') {
                // Ocultar...
            } else if (method === 'UNHIDE') {
                // Exibir...
            }
        } else if (name && method === 'RENAME') {
            channel.edit({ name });
        }
    }
}
