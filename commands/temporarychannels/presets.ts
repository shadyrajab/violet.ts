import {
    Client, CommandInteraction, Message, MessageReaction, User, EmbedBuilder, Role, GuildMember
} from 'discord.js';
import { PresetsManager } from '../../managers/presetsManager';
import { Command } from '../../structures/command';
import { ChannelMethods, Language } from '../../structures/types';
import {
    created, embedChannelName, embedTitle, limitReached, notFound,
    addMember, deleted, embedAdmins, embedBlocks, embedDelete, embedHide, embedLock, embedMembers, embedObs, removeMember, removeOrAdd, whatName, willBeHided, willBeLocked,
} from '../../translations/temporarychannels/presetsMessages';
import { charactersLimitReached, memberNotFound } from '../../translations/temporarychannels/globalMessages';
import { getMembersAndRoles } from '../../utils/trFunctions';

const { Colors: { grayishPurple } } = require('../../database/utils.json');

export class Presets extends Command {
    constructor(client: Client) {
        super(new Command({
            client,

            name: 'presets',
            description: 'Temporary channels • Display your presets from this server.',

            execute: async (interaction, language) => {
                const guild = interaction.guild!;
                const presetsManager = new PresetsManager(interaction.user, guild, this.client);
                const { presets, userPresets, userGuildPresets } = await presetsManager.getPresets();

                if (!userGuildPresets) {
                    await handleNoUserPresets(interaction, language, presetsManager, presets, userPresets);
                } else {
                    await handleUserPresets(interaction, language, presetsManager);
                }
            },
        }));
    }
}

async function handleNoUserPresets(interaction: CommandInteraction, language: Language, presetsManager: PresetsManager, presets: any, userPresets: any) {
    const message = await interaction.reply({
        content: notFound(language),
        fetchReply: true,
    }) as Message;

    message.react('🔸');
    const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '🔸' && user === interaction.user;
    const collector = message.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async () => {
        if (!presets || Object.keys(userPresets).length < 2) {
            await presetsManager.create();
            await interaction.followUp({
                content: created(language),
                ephemeral: true,
            });
        } else if (Object.keys(userPresets).length === 2) {
            await interaction.followUp({
                content: limitReached(language),
                ephemeral: true,
            });
        }
    });
}

async function handleUserPresets(interaction: CommandInteraction, language: Language, presetsManager: PresetsManager) {
    const channelName = await presetsManager.getChannelName();
    const isHided = await presetsManager.isHided();
    const isLocked = await presetsManager.isLocked();
    const members = await presetsManager.getUsersFrom('members');
    const admins = await presetsManager.getUsersFrom('admins');
    const blocks = await presetsManager.getUsersFrom('blocks');

    const embed = createEmbed(language, interaction.user.avatarURL() as string, channelName, isHided, isLocked, members, admins, blocks);
    const message = await interaction.reply({ embeds: [embed], fetchReply: true }) as Message;

    await addReactions(message);

    const filter = (_reaction: MessageReaction, user: User) => user === interaction.user;
    const collector = message.createReactionCollector({ filter, time: 20000 });

    collector.on('collect', async (reaction: MessageReaction) => {
        await handleReaction(reaction, language, interaction, presetsManager);
    });
}

function createEmbed(language: Language, avatarURL: string, channelName: string, isHided: boolean, 
    isLocked: boolean, members: (Role | GuildMember)[] | undefined, admins: (Role | GuildMember)[] | undefined, blocks: (Role | GuildMember)[] | undefined): EmbedBuilder {
    const inviteURL = 'https://discord.com/api/oauth2/authorize?client_id=862740130385494027&permissions=2434092112&scope=bot%20applications.commands'
    const fields = [
        { name: embedChannelName(language), value: `[${channelName}](${inviteURL})`, inline: true },
        { name: embedLock(language), value: `[${isLocked}](${inviteURL})`, inline: true},
        { name: embedHide(language), value: `[${isHided}](${inviteURL})`, inline: false},
        { name: embedMembers(language), value: members?.length ? members.join(', ') : '\u200B', inline: true },
        { name: embedAdmins(language), value: admins?.length ? admins.join(', ') : '\u200B', inline: true },
        { name: embedBlocks(language), value: blocks?.length ? blocks.join(', ') : '\u200B', inline: false },
        { name: '\u200B', value: embedDelete(language), inline: true }
    ]
    return new EmbedBuilder()
        .setColor(grayishPurple)
        .setAuthor({ name: embedTitle(language), iconURL: avatarURL })
        .addFields(fields)
        .setFooter({ text: embedObs(language) });
}

async function addReactions(message: Message) {
    const reactions = ['📄', '🔒', '🔗', '👥', '👑', '❌', '🚫'];
    for (const reaction of reactions) {
        await message.react(reaction);
    }
}

async function handleReaction(reaction: MessageReaction, language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    switch (reaction.emoji.name) {
        case '📄':
            await handleRename(language, interaction, presetsManager);
            break;
        case '🔒':
            await handleLockToggle(language, interaction, presetsManager);
            break;
        case '🔗':
            await handleHideToggle(language, interaction, presetsManager);
            break;
        case '❌':
            await handleDelete(language, interaction, presetsManager);
            break;
        case '👑':
            await handleAdminOption(language, interaction, presetsManager);
            break;
        case '🚫':
            await handleBlockOption(language, interaction, presetsManager);
            break;
        case '👥':
            await handleMemberOption(language, interaction, presetsManager);
            break;
        default:
            break;
    }
}

async function handleRename(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    const replyMessage = await interaction.followUp({
        content: whatName(language),
        fetchReply: true,
    }) as Message;

    const replyFilter = (message: Message) => message.author.id === interaction.user.id;
    const replyCollector = replyMessage.channel.createMessageCollector({ filter: replyFilter, time: 60000 });

    replyCollector.on('collect', async (response: Message) => {
        if (response.content.length > 25) {
            response.react('❌');
            response.reply(charactersLimitReached(language, 25));
        } else {
            await presetsManager.manage({ method: 'RENAME', name: response.content });
            response.react('✅');
        }
        replyCollector.stop();
    });
}

async function handleLockToggle(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    const method = (await presetsManager.isLocked()) ? 'UNLOCK' : 'LOCK';
    await presetsManager.manage({ method });
    await interaction.followUp(willBeLocked(language));
}

async function handleHideToggle(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    const method = (await presetsManager.isHided()) ? 'UNHIDE' : 'HIDE';
    await presetsManager.manage({ method });
    await interaction.followUp(willBeHided(language));
}

async function handleDelete(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    await presetsManager.delete();
    await interaction.followUp(deleted(language));
}

async function handleAdminOption(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    await handleOption(language, interaction, presetsManager, 'ADMIN');
}

async function handleBlockOption(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    await handleOption(language, interaction, presetsManager, 'BLOCK');
}

async function handleMemberOption(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager) {
    await handleOption(language, interaction, presetsManager, 'MEMBER');
}

async function handleOption(language: Language, interaction: CommandInteraction, presetsManager: PresetsManager, option: string) {
    const replyMessage = await interaction.followUp({
        content: removeOrAdd(language),
        fetchReply: true,
    }) as Message;

    replyMessage.react('✅');
    replyMessage.react('❌');

    const reactFilter = (_reaction: MessageReaction, user: User) => user === interaction.user;
    const reactCollector = replyMessage.createReactionCollector({ filter: reactFilter, time: 20000 });

    reactCollector.on('collect', async (reaction: MessageReaction) => {
        const { membersAndRoles, notFound } = getMembersAndRoles(reaction.message.content as string, interaction.guild!);

        let method: ChannelMethods;
        if (option === 'BLOCK') {
            method = (reaction.emoji.name === '✅') ? 'BLOCK_MEMBER' : 'UNBLOCK_MEMBER';
        } else {
            method = (reaction.emoji.name === '✅') ? `ADD_${option}` as ChannelMethods : `REMOVE_${option}` as ChannelMethods;
        }

        for (const user of membersAndRoles) {
            await presetsManager.manage({ method, member: user });
        }

        if (notFound) {
            reaction.message.reply(memberNotFound(language));
        } else if (membersAndRoles.length) {
            reaction.message.react('✅');
        } else {
            reaction.message.react('❌');
        }
    });
}
