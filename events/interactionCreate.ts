import { Client, PermissionsString, Guild, GuildMember, Interaction, UserResolvable, VoiceBasedChannel, GuildChannelResolvable } from 'discord.js';
import { Command } from '../structures/command';
import { notAdmin, notConnected, notOwner } from '../translations/temporarychannels/globalMessages';
import { ProfileManager } from '../managers/profileManager';
import { GuildManager } from '../managers/guildManager';
import { onlyGuilds, needPermission } from '../translations/interactionMessages';
import { permissionsRemoved } from '../translations/globalMessages';
import { Room } from '../managers/roomManager';

export default (client: Client, commands: Array<Command>) => {
    client.on('interactionCreate', async (interaction: Interaction) => { 
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        const user = interaction.user;
        const reason = `🔧 /${commandName}: Requested by: ${user.tag} | ${user.id}`;
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;
        const command = commands.find(command => command.name === commandName);
        const commandPermission = command?.permissions;

        const profileManager = new ProfileManager(user);
        const guildManager = new GuildManager(guild);
        const language = await profileManager.getLanguage() || await guildManager.getLanguage()

        if (!guild && !command?.direct) interaction.reply({ content: onlyGuilds(language), ephemeral: true });

        if (!guild && command?.direct) {
            try {
                return command?.execute(interaction, language, reason);
            } catch (err) {
                console.error(err);
            }
        }

        const botPermissions = (await guild.members.fetch(client.user?.id as UserResolvable))?.permissionsIn(interaction.channel as GuildChannelResolvable).toArray();

        if (commandPermission) {
            for (const permissionName of commandPermission) {
                if (['TRCHANNEL_OWNER', 'TRCHANNEL_ADMIN'].includes(permissionName)) {
                    const { voice } = member;
                    if (!voice?.channel || !await Room.isRoom(voice.channel)) {
                        interaction.reply({ content: notConnected(language), ephemeral: true });
                    }
                    const room = new Room(voice.channel as VoiceBasedChannel);
                    if (permissionName === 'TRCHANNEL_OWNER' && !(await room.isOwner(member))) {
                        interaction.reply({ content: notOwner(language), ephemeral: true });
                    }
                    if (permissionName === 'TRCHANNEL_ADMIN' && !(await room.isAdmin(member) || await room.isOwner(member))) {
                        interaction.reply({ content: notAdmin(language), ephemeral: true });
                    }
                } else if (!botPermissions?.includes(permissionName as PermissionsString) || permissionName === 'SendMessages') {
                    interaction.reply({ content: permissionsRemoved(language), ephemeral: true });
                } else if (!interaction.memberPermissions?.has(permissionName as PermissionsString)) {
                    interaction.reply({ content: needPermission(language, permissionName as PermissionsString), ephemeral: true });
                }
            }
        }

        try {
            command?.execute(interaction, language, reason);
        } catch (err) {
            console.error(err);
        }
    });
};
