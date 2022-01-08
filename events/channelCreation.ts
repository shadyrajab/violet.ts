import {
  Client, DiscordAPIError, CategoryChannelResolvable, VoiceChannel,
} from 'discord.js';
import {GuildManager} from '../structures/managers/guildManager';
import {PresetsManager} from '../structures/managers/presetsManager';
import {ProfileManager} from '../structures/managers/profileManager';
import {Room} from '../structures/managers/roomManager';
import {permissionsRemoved} from '../translations/globalMessages';
import {simultaneousChannel} from '../translations/temporarychannels/globalMessages';

export default (client: Client) => {
  client.on('voiceStateUpdate', async (_oldState, newState) => {
    const {guild} = newState;
    const {channel} = newState;
    const member = newState.member!;
    const user = member.user;
    const guildManager = new GuildManager(guild);
    const profileManager = new ProfileManager(user);
    const language = await profileManager.getLanguage() || await guildManager.getLanguage();
    const {trcategory, trchannel} = await guildManager.getTrChannels();
    if ((trcategory && trchannel && channel) && (channel.id === trchannel.id)) {
      if (await Room.checkRooms(user)) {
        // If the user have 2 temporary channels created, kick and send him a message
        try {
          member.send(`${member}, ${simultaneousChannel(language)}`);
        } catch {}
        member.edit({channel: null});
        return;
      }
      const presetsManager = new PresetsManager(user, guild, client);
      let channelName = await presetsManager.getChannelName();
      channelName = (!channelName || channelName === 'default') ? `${user.username}'s channel` : channelName;

      try {
        const tempChannel = await guild.channels.create(channelName, {
          type: 'GUILD_VOICE',
          parent: trcategory as CategoryChannelResolvable,
          reason: `New tr channel to ${user.username}#${user.discriminator} | ${user.id}`,
        });
        presetsManager.setPresets(tempChannel.permissionOverwrites, member);
        new Room(tempChannel, user).create();
        member.edit({channel: tempChannel});
      } catch (err) {
        if (err instanceof DiscordAPIError && err.message === 'Missing Permissions') {
          try {
            member.send(permissionsRemoved(language));
          } catch {}
        }
      }
    }

    if (trchannel && trcategory) {
      for (const channel of trcategory.children) {
        const voiceChannel = channel[1];
        if (voiceChannel instanceof VoiceChannel) {
          let channelMembersCount = Array.from(voiceChannel.members).length;
          if (!channelMembersCount && voiceChannel !== trchannel && await Room.isRoom(voiceChannel)) {
            setTimeout(async () => {
              channelMembersCount = Array.from(voiceChannel.members).length;
              if (!channelMembersCount) {
                try {
                  new Room(voiceChannel).delete();
                  await voiceChannel.delete('Inactivity');
                } catch {}
              }
            }, 20000);
          }
        }
      }
    }
  });
};
