import {
  Client,
  Guild,
  GuildChannelResolvable,
  GuildMember,
  Interaction,
  PermissionString,
  UserResolvable,
} from 'discord.js';
import {Command} from '../structures/structures/command';
import {notAdmin, notConnected, notOwner} from '../translations/temporarychannels/globalMessages';
import {ProfileManager} from '../structures/managers/profileManager';
import {GuildManager} from '../structures/managers/guildManager';
import {fetchCommandData} from '../utils/fetchFunctions';
import {onlyGuilds, needPermission, unavailableCommand} from '../translations/interactionMessages';
import {permissionsRemoved} from '../translations/globalMessages';
import {Language} from '../structures/structures/types';
import {Room} from '../structures/managers/roomManager';

const unavailableCommands = ['lyrics', 'profile', 'help'];

export default (client: Client, commands: Array <Command>) => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    const {commandName} = interaction;
    const reason = `🔧 /${commandName}: Requested by: ${interaction.user} | ID: ${interaction.user.id}`;
    const guild = interaction.guild as Guild;
    const member = interaction.member as GuildMember;
    const command = commands.find((command) => command.name === commandName);
    const commandPermission = command?.permissions;
    const profileManager = new ProfileManager(interaction.user);
    const guildManager = new GuildManager(guild);
    await fetchCommandData(commandName);
    const language = await profileManager.getLanguage() || await guildManager.getLanguage() as Language || 'english';
    if (!guild && !command?.direct) return interaction.reply(onlyGuilds((language)));
    if (!guild && command?.direct) {
      try {
        return command?.execute(interaction, language, reason);
      } catch (err) {
        console.log(err);
      }
    }
    const botPermissions = (await interaction.guild?.members.fetch(interaction.client.user?.id as UserResolvable))?.permissionsIn(interaction.channel as GuildChannelResolvable).toArray();
    if (unavailableCommands.find((command: string) => command === commandName)) {
      return interaction.reply({
        content: unavailableCommand(language),
        ephemeral: true,
      });
    }
    if (commandPermission) {
      for (const permissionName of commandPermission) {
        if (permissionName === 'TRCHANNEL_OWNER' || permissionName === 'TRCHANNEL_ADMIN') {
          const {voice} = member;
          if (!voice.channel || !await Room.isRoom(voice.channel!)) {
            return interaction.reply({
              content: notConnected(language),
              ephemeral: true,
            });
          }
          const room = new Room(voice.channel!);
          if (permissionName === 'TRCHANNEL_OWNER' && !await room.isOwner(member)) {
            return interaction.reply({
              content: notOwner(language),
              ephemeral: true,
            });
          }
          if (permissionName === 'TRCHANNEL_ADMIN' && !await room.isAdmin(member) && !await room.isOwner(member)) {
            return interaction.reply({
              content: notAdmin(language),
              ephemeral: true,
            });
          }
        } else if (!botPermissions?.find((permission: PermissionString) => permission === permissionName) || !botPermissions?.find((permission: PermissionString) => permission === 'SEND_MESSAGES')) {
          return interaction.reply({
            content: permissionsRemoved(language),
            ephemeral: true,
          });
        } else if (!interaction.memberPermissions?.has(permissionName as PermissionString)) {
          return interaction.reply({
            content: needPermission(language, permissionName as PermissionString),
            ephemeral: true,
          });
        }
      }
    }
    try {
      return command?.execute(interaction, language, reason);
    } catch (err) {
      console.log(err);
    }
  });
};
