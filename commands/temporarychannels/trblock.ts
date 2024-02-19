import { Client, CommandInteraction, GuildMember, EmbedBuilder, VoiceBasedChannel, ApplicationCommandOptionType } from 'discord.js';
import { Room } from '../../managers/roomManager';
import { Command } from '../../structures/command';
import { memberNotFound } from '../../translations/temporarychannels/globalMessages';
import { trblockReply, trunblockReply } from '../../translations/temporarychannels/trblockMessages';
import { getMembersAndRoles } from '../../utils/trFunctions';
import { Language, ChannelMethods } from '../../structures/types';

const { Colors: { grayishPurple } } = require('../../database/utils.json');

export class TRBlock extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trblock',
            description: 'Temporary channels • Block a member from your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            options: [{
                name: 'user',
                description: 'The user or role that you want to block.',
                required: true,
                type: ApplicationCommandOptionType.String,
            }, {
                name: 'hide',
                description: 'If you want to hide the channel from this user.',
                required: true,
                type: ApplicationCommandOptionType.Boolean,
            }],
            
            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand(interaction, language, 'BLOCK_MEMBER');
            },
        }));
    }
}

export class TRUnblock extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trunblock',
            description: 'Temporary channels • Unblock a member from your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            options: [{
                name: 'user',
                description: 'The user or role that you want to block.',
                required: true,
                type: ApplicationCommandOptionType.String,
            }],

            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand(interaction, language, 'UNBLOCK_MEMBER');
            },
        }));
    }
}

async function executeCommand(interaction: CommandInteraction, language: Language, method: ChannelMethods) {
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
    const embedContent = method === 'BLOCK_MEMBER' ? trblockReply(language, members.join(', ')) : trunblockReply(language, members.join(', '));
    const embed = buildEmbed(channel, member, embedContent);
    interaction.reply({ embeds: [embed], ephemeral: true });
    if (notFound) {
        interaction.followUp({
            content: memberNotFound(language),
            ephemeral: true,
        });
    }
}

function buildEmbed(channel: VoiceBasedChannel, member: GuildMember, content: string) {
    return new EmbedBuilder()
        .setColor(grayishPurple)
        .setAuthor({ name: channel.name, iconURL: member.user.avatarURL()! })
        .addFields({ name: '\u200B', value: content})
        .setTimestamp(Date.now())
        .setImage('https://i.imgur.com/dnwiwSz.png');
}