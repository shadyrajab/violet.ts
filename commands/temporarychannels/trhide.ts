import { Client, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { Room } from '../../managers/roomManager';
import { Command } from '../../structures/command';
import { trhideReply, trunhideReply } from '../../translations/temporarychannels/trhideMessages';
import { Language, ChannelMethods } from '../../structures/types';

const { Colors: { grayishPurple } } = require('../../database/utils.json');

export class TRHide extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trhide',
            description: 'Temporary channels • Remove the visibility from your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],

            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand('HIDE', interaction, language)
            }
        }));
    }
}

export class TRUnhide extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trunhide',
            description: 'Temporary channels • Remove the invisibility from your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],

            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand('UNHIDE', interaction, language)
            }
        }));
    }
}

async function executeCommand(method: ChannelMethods, interaction: CommandInteraction, language: Language) {
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel!;
    const { everyone } = interaction.guild!.roles;
    const room = new Room(channel);
    await room.manage({ method, role: everyone });
    const embed = new EmbedBuilder()
        .setColor(grayishPurple)
        .setAuthor({ name: channel.name, iconURL: member.user.avatarURL()! })
        .addFields({ name: '\u200B', value: method === 'HIDE' ? trhideReply(language) : trunhideReply(language) })
        .setTimestamp(Date.now())
        .setImage('https://i.imgur.com/dnwiwSz.png');
    interaction.reply({ embeds: [embed], ephemeral: true });
}