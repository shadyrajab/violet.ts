import { Client, DiscordAPIError, ChannelType } from 'discord.js';
import { GuildManager } from '../managers/guildManager';
import { PresetsManager } from '../managers/presetsManager';
import { ProfileManager } from '../managers/profileManager';
import { Room } from '../managers/roomManager';
import { permissionsRemoved } from '../translations/globalMessages';
import { simultaneousChannel } from '../translations/temporarychannels/globalMessages';

export default (client: Client) => {
    client.on('voiceStateUpdate', async (_oldState, newState) => {
        const { guild, channel } = newState;
        const member = newState.member!;
        const user = member.user;

        const guildManager = new GuildManager(guild);
        const profileManager = new ProfileManager(user);
        const language = await profileManager.getLanguage() || await guildManager.getLanguage();
        const { trcategory, trchannel } = await guildManager.getTrChannels();

        if (trcategory && trchannel && channel && channel.id === trchannel.id) {
            if (await Room.checkRooms(user)) {
                try {
                    await member.send(`${member}, ${simultaneousChannel(language)}`);
                } catch {}
                await member.edit({ channel: null });
                return;
            }

            const presetsManager = new PresetsManager(user, guild, client);
            let channelName = await presetsManager.getChannelName();
            channelName = (!channelName || channelName === 'default') ? `${user.username}'s channel` : channelName;

            try {
                const tempChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildVoice,
                    parent: trcategory,
                    reason: `New tr channel to ${user.tag}`,
                });
                await presetsManager.setPresets(tempChannel.permissionOverwrites, member);
                new Room(tempChannel, user).create();
                await member.edit({ channel: tempChannel });
            } catch (err) {
                if (err instanceof DiscordAPIError && err.message === 'Missing Permissions') {
                    try {
                        await member.send(permissionsRemoved(language));
                    } catch {}
                }
            }
        }

        if (trchannel && trcategory) {
            const voiceChannels = Array.from(trcategory.children.cache.values()).filter(channel => channel.type === ChannelType.GuildVoice);
        
            for (const voiceChannel of voiceChannels) {
                if (voiceChannel.type === ChannelType.GuildVoice && voiceChannel.members.size === 0 && voiceChannel !== trchannel && await Room.isRoom(voiceChannel)) {
                    setTimeout(async () => {
                        if (voiceChannel.members.size === 0) {
                            try {
                                new Room(voiceChannel).delete();
                                await voiceChannel.delete('Inactivity');
                            } catch {}
                        }
                    }, 20000);
                }
            }
        }
    });
};
