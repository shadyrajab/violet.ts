import { Client, VoiceChannel } from 'discord.js';
import { GuildManager } from '../managers/guildManager';
import { Room } from '../managers/roomManager';

export default (client: Client) => {
    client.on('channelDelete', async (channel) => {
        if (channel instanceof VoiceChannel) {
            const { guild } = channel;
            const guildManager = new GuildManager(guild);
            const { trcategory, trchannel } = await guildManager.getTrChannels();
            if (trcategory && trchannel && await Room.isRoom(channel)) {
                new Room(channel).delete();
            }
        }
    });
};
