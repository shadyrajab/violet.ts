import { Client, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { Room } from '../../managers/roomManager';
import { Command } from '../../structures/command';
import { trlockReply, trunlockReply } from '../../translations/temporarychannels/trlockMessages';
import { Language, ChannelMethods } from '../../structures/types';

const { Colors: { grayishPurple } } = require('../../database/utils.json');

export class TRLock extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trlock',
            description: 'Temporary channels • Lock your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand('LOCK', interaction, language);
            }
        }));
    }
}

export class TRUnlock extends Command {
    constructor(client: Client) {
        super(new Command({
            client,
            name: 'trunlock',
            description: 'Temporary channels • Unlock your temporary channel.',
            permissions: ['TRCHANNEL_ADMIN'],
            execute: async (interaction: CommandInteraction, language: Language) => {
                await executeCommand('UNLOCK', interaction, language);
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
        .addFields({ name: '\u200B', value: method === 'LOCK' ? trlockReply(language) : trunlockReply(language) })
        .setTimestamp(Date.now())
        .setImage('https://i.imgur.com/dnwiwSz.png');
    interaction.reply({ embeds: [embed], ephemeral: true });
}
