import { Client, CommandInteraction, GuildMember, EmbedBuilder, VoiceBasedChannel, ApplicationCommandOptionType } from 'discord.js';
import { Room } from '../../managers/roomManager';
import { Command } from '../../structures/command';
import { memberNotFound } from '../../translations/temporarychannels/globalMessages';
import { traddMemberReply, tremoveMemberReply } from '../../translations/temporarychannels/traddMessages';
import { getMembersAndRoles } from '../../utils/trFunctions';
import { Language, ChannelMethods } from '../../structures/types';

const { Colors: { grayishPurple } } = require('../../database/utils.json');

export class TRAdd extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'tradd',
            description: 'Temporary channels • Add a member in your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            options: [{
                name: 'members',
                description: 'The users or roles that you want to add.',
                required: true,
                type: ApplicationCommandOptionType.String,
            }],
            
            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand(interaction, language, 'ADD_MEMBER');
            },
        }));
    }
}
  
export class TRemove extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'tremove',
            description: 'Temporary channels • Remove a member from your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            options: [{
                name: 'members',
                description: 'The users or roles that you want to remove.',
                required: true,
                type: ApplicationCommandOptionType.String,
            }],

            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand(interaction, language, 'REMOVE_MEMBER');
            },
        }));
    }
}

function buildEmbed(channel: VoiceBasedChannel, member: GuildMember, content: string) {
    return new EmbedBuilder()
        .setColor(grayishPurple)
        .setAuthor({ name: channel.name, iconURL: member.user.avatarURL()! })
        .addFields({ name: '\u200B', value: content })
        .setTimestamp(Date.now())
        .setImage('https://i.imgur.com/dnwiwSz.png');
}

async function executeCommand(interaction: CommandInteraction, language: Language, method: ChannelMethods) {
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel!;
    const { members, notFound } = getMembersAndRoles(interaction.options.get('members')?.value as string, interaction.guild!);
    if (!members.length) {
        return interaction.reply({ content: memberNotFound(language), ephemeral: true });
    }
    const room = new Room(channel);
    await room.manage({ method, members });
    const embedContent = method === 'ADD_MEMBER' ? traddMemberReply(language, members.join(', ')) : tremoveMemberReply(language, members.join(', '));
    const embed = buildEmbed(channel, member, embedContent);
    interaction.reply({ embeds: [embed], ephemeral: true });
    if (notFound) {
        interaction.followUp({ content: memberNotFound(language), ephemeral: true });
    }
}
