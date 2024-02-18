import { Client, Guild, GuildMember, PermissionOverwriteManager, Role, User } from 'discord.js';
import { presetScheme } from '../database/schemes/presetsScheme';
import { ChannelMethods } from '../structures/types';

interface PresetsData {
    name: string;
    hide: boolean;
    lock: boolean;
    members: string[];
    admins: string[];
    blocks: string[];
}

interface ManageData {
    method: ChannelMethods;
    name?: string;
    member?: GuildMember | Role;
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
        const presets = await presetScheme.findOne({ userId: this.user.id });
        const userPresets = presets?.presets;
        const userGuildPresets = userPresets?.[this.guild.id];
        return { presets, userPresets, userGuildPresets };
    }

    async getChannelName() {
        const { userGuildPresets } = await this.getPresets();
        return userGuildPresets?.name;
    }

    async isHided() {
        const { userGuildPresets } = await this.getPresets();
        return userGuildPresets?.hide;
    }

    async isLocked() {
        const { userGuildPresets } = await this.getPresets();
        return userGuildPresets?.lock;
    }

    async getUsersFrom(arrayName: 'members' | 'admins' | 'blocks') {
        const { userGuildPresets } = await this.getPresets();
        if (!userGuildPresets) return;

        const users: (Role | GuildMember)[] = [];
        for (const userId of userGuildPresets[arrayName]) {
            const user = this.guild.roles.cache.get(userId) || await this.guild.members.fetch(userId);
            if (!user) {
                userGuildPresets[arrayName].splice(userGuildPresets[arrayName].indexOf(userId));
                await this.updatePresets(userGuildPresets);
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
            Connect: true,
            ViewChannel: true,
            ManageChannels: true,
            ManageRoles: true,
            MuteMembers: true,
            MoveMembers: true,
            DeafenMembers: true,
        });

        if (await this.isHided()) {
            channelOverwrites.edit(everyone, {
                ViewChannel: false,
            });
        }

        if (await this.isLocked()) {
            channelOverwrites.edit(everyone, {
                Connect: false,
            });
        }

        for (const member of members || []) {
            channelOverwrites.edit(member, {
                Connect: true,
                ViewChannel: true,
            });
        }

        for (const admin of admins || []) {
            channelOverwrites.edit(admin, {
                Connect: true,
                ViewChannel: true,
                ManageChannels: true,
                ManageRoles: true,
                MuteMembers: true,
                MoveMembers: true,
                DeafenMembers: true,
            });
        }

        for (const block of blocks || []) {
            channelOverwrites.edit(block, {
                Connect: false,
                ViewChannel: false,
            });
        }
    }

    async create() {
        const { presets } = await this.getPresets();
        if (!presets) {
            const defaultPresets: PresetsData = {
                name: 'default',
                hide: false,
                lock: false,
                members: [],
                admins: [],
                blocks: [],
            };
            await presetScheme.create({
                userId: this.user.id,
                presets: {
                    [this.guild.id]: defaultPresets,
                },
            });
        }
    }

    async updatePresets(updatedPresets: PresetsData) {
        const { presets } = await this.getPresets();
        await presets?.updateOne({ presets: updatedPresets });
        await presets?.save().catch((err: Error) => console.log(err));
    }

    async delete() {
        await presetScheme.deleteOne({ userId: this.user.id });
    }

    async manage({ method, name, member }: ManageData) {
        const { userPresets, userGuildPresets } = await this.getPresets();
        const channelMembers = userGuildPresets?.members || [];
        const channelAdmins = userGuildPresets?.admins || [];
        const channelBlocks = userGuildPresets?.blocks || [];
        if (method === 'RENAME') userGuildPresets!.name = name!;
        if (method === 'HIDE') userGuildPresets!.hide = true;
        if (method === 'LOCK') userGuildPresets!.lock = true;
        if (method === 'ADD_MEMBER') channelMembers.push(member!.id);
        if (method === 'ADD_ADMIN') channelAdmins.push(member!.id);
        if (method === 'BLOCK_MEMBER') channelBlocks.push(member!.id);
        if (method === 'REMOVE_MEMBER') channelMembers.splice(channelMembers.indexOf(member!.id), 1);
        if (method === 'REMOVE_ADMIN') channelAdmins.splice(channelAdmins.indexOf(member!.id), 1);
        if (method === 'UNBLOCK_MEMBER') channelBlocks.splice(channelBlocks.indexOf(member!.id), 1);
        await this.updatePresets(userPresets![this.guild.id]);
    }
}
