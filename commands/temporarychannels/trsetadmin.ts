import { Client, GuildMember, EmbedBuilder, CommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { Room } from '../../managers/roomManager';
import { Command } from '../../structures/command';
import { memberNotFound } from '../../translations/temporarychannels/globalMessages';
import { traddMemberReply, tremoveMemberReply } from '../../translations/temporarychannels/traddMessages';
import { Language, ChannelMethods } from '../../structures/types';
import { getMembersAndRoles } from '../../utils/trFunctions';

const { Colors: { grayishPurple } } = require('../../database/utils.json');

export class TRSetAdmin extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trsetadmin',
            description: 'Temporary channels • Set a member from your channel as admin.',
            permissions: ['TRCHANNEL_ADMIN'],
            options: [{
                name: 'members',
                description: 'The users or roles that you want to set as admin.',
                required: true,
                type: ApplicationCommandOptionType.String,
            }],
            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand('ADD_ADMIN', interaction, language);
            }
        }));
    }
}

export class TRRemoveAdmin extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'tremoveadmin',
            description: 'Temporary channels • Remove an admin from your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            options: [{
                name: 'members',
                description: 'The users or roles that you want to remove.',
                required: true,
                type: ApplicationCommandOptionType.String,
            }],
            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand('REMOVE_ADMIN', interaction, language);
            }
        }));
    }
}

async function executeCommand(method: ChannelMethods, interaction: CommandInteraction, language: Language) {
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel!;
    const { members, notFound } = getMembersAndRoles(interaction.options.get('members')?.value as string, interaction.guild!);
    if (!members.length) {
        return interaction.reply({
            content: memberNotFound(language),
            ephemeral: true,
        });
    }
    const room = new Room(channel);
    await room.manage({ method, members });
    const embed = new EmbedBuilder()
        .setColor(grayishPurple)
        .setAuthor({ name: channel.name, iconURL: member.user.avatarURL()! })
        .addFields({ name: '\u200B', value: method === 'ADD_ADMIN' ? traddMemberReply(language, members.join(', ')) : tremoveMemberReply(language, members.join(', ')) })
        .setTimestamp(Date.now())
        .setImage('https://i.imgur.com/dnwiwSz.png');
    interaction.reply({ embeds: [embed], ephemeral: true });
    if (notFound) {
        interaction.followUp({
            content: memberNotFound(language),
            ephemeral: true,
        });
    }
}
