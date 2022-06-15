import {
  Client, Message, MessageEmbed, MessageReaction, User,
} from 'discord.js';
import {PresetsManager} from '../../structures/managers/presetsManager';
import {Command} from '../../structures/structures/command';
import {ChannelMethods} from '../../structures/structures/types';
import {charactersLimitReached, memberNotFound} from '../../translations/temporarychannels/globalMessages';
import {
  created,
  embedChannelName,
  embedTitle,
  limitReached,
  notFound,
  addMember,
  deleted,
  embedAdmins,
  embedBlocks,
  embedDelete,
  embedHide,
  embedLock,
  embedMembers,
  embedObs,
  removeMember,
  removeOrAdd,
  whatName,
  willBeHided,
  willBeLocked,
} from '../../translations/temporarychannels/presetsMessages';
import {getMembersAndRoles} from '../../utils/trFunctions';

const {Colors: {grayishPurple}} = require('../../database/utils.json');

export class Presets extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'presets',
      description: 'Temporary channels • Display your presets from this server.',

      execute: async (interaction, language) => {
        const guild = interaction.guild!;
        const presetsManager = new PresetsManager(interaction.user, guild, this.client);
        const {presets, userPresets, userGuildPresets} = await presetsManager.getPresets();
        if (!userGuildPresets) {
          const message = await interaction.reply({
            content: notFound(language),
            fetchReply: true,
          }) as Message;
          message.react('🔸');
          const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '🔸' && user === interaction.user;
          const collector = message.createReactionCollector({filter, time: 60000});
          collector.on('collect', async () => {
            if (!presets || Object.keys(userPresets).length < 2) {
              await presetsManager.create();
              return interaction.followUp({
                content: created(language),
                ephemeral: true,
              });
            } if (Object.keys(userPresets).length === 2) {
              return interaction.followUp({
                content: limitReached(language),
                ephemeral: true,
              });
            }
          });
        } else {
          let option: string;
          const channelName = await presetsManager.getChannelName();
          const isHided = await presetsManager.isHided();
          const isLocked = await presetsManager.isLocked();
          const members = await presetsManager.getUsersFrom('members');
          const admins = await presetsManager.getUsersFrom('admins');
          const blocks = await presetsManager.getUsersFrom('blocks');
          const embed = new MessageEmbed()
              .setColor(grayishPurple)
              .setAuthor({name: embedTitle(language), iconURL: interaction.user.avatarURL()!})
              .addField(embedChannelName(language), `[${channelName}](https://discord.com/api/oauth2/authorize?client_id=862740130385494027&permissions=2434092112&scope=bot%20applications.commands)`, true)
              .addField(embedLock(language), `[${isLocked}](https://discord.com/api/oauth2/authorize?client_id=862740130385494027&permissions=2434092112&scope=bot%20applications.commands)`, true)
              .addField(embedHide(language), `[${isHided}](https://discord.com/api/oauth2/authorize?client_id=862740130385494027&permissions=2434092112&scope=bot%20applications.commands)`, false)
              .addField(embedMembers(language), members!.length ? members!.join(', ') : '\u200B', true)
              .addField(embedAdmins(language), admins!.length ? admins!.join(', ') : '\u200B', true)
              .addField(embedBlocks(language), blocks!.length ? blocks!.join(', ') : '\u200B', false)
              .addField('\u200B', embedDelete(language), true)
              .setFooter(embedObs(language));
          const message = await interaction.reply({embeds: [embed], fetchReply: true}) as Message;
          message.react('📄');
          message.react('🔒');
          message.react('🔗');
          message.react('👥');
          message.react('👑');
          message.react('❌');
          message.react('🚫');
          const filter = (_reaction: MessageReaction, user: User) => user === interaction.user;
          const collector = message.createReactionCollector({filter, time: 20000});
          collector.on('collect', async (reaction: MessageReaction) => {
            if (reaction.emoji.name === '📄') {
              const replyMessage = await interaction.followUp({
                content: whatName(language),
                fetchReply: true,
              }) as Message;
              const replyFilter = (message: Message) => message.author.id === interaction.user.id;
              const replyCollector = replyMessage.channel.createMessageCollector({filter: replyFilter, time: 60000});
              replyCollector.on('collect', async (response: Message) => {
                if (response.content.length > 25) {
                  response.react('❌');
                  response.reply(charactersLimitReached(language, 25));
                }
                await presetsManager.manage({method: 'RENAME', name: response.content});
                response.react('✅');
                return replyCollector.stop() 
              });
            }
            if (reaction.emoji.name === '🔒') {
              const method = (isLocked) ? 'UNLOCK' : 'LOCK';
              await presetsManager.manage({method});
              return interaction.followUp(willBeLocked(language));
            }
            if (reaction.emoji.name === '🔗') {
              const method = (isHided) ? 'UNHIDE' : 'HIDE';
              await presetsManager.manage({method});
              return interaction.followUp(willBeHided(language));
            }
            if (reaction.emoji.name === '🚫') {
              await presetsManager.delete();
              return interaction.followUp(deleted(language));
            }
            if (reaction.emoji.name === '👑') {
              option = 'ADMIN';
              collector.stop();
            }
            if (reaction.emoji.name === '❌') {
              option = 'BLOCK';
              collector.stop();
            }
            if (reaction.emoji.name === '👥') {
              option = 'MEMBER';
              collector.stop();
            }
            if (option) {
              const replyMessage = await interaction.followUp({
                content: removeOrAdd(language),
                fetchReply: true,
              }) as Message;
              replyMessage.react('✅');
              replyMessage.react('❌');
              const reactFilter = (_reaction: MessageReaction, user: User) => user === interaction.user;
              const reactCollector = replyMessage.createReactionCollector({filter: reactFilter, time: 20000});
              reactCollector.on('collect', async (reaction: MessageReaction) => {
                if (reaction.emoji.name === '✅') {
                  const addMembersMessage = await replyMessage.reply(addMember(language));
                  const memberFilter = (message: Message) => message.author.id === interaction.user.id;
                  const memberCollector = addMembersMessage.channel.createMessageCollector({filter: memberFilter, time: 20000});
                  memberCollector.on('collect', async (response: Message) => {
                    const members = getMembersAndRoles(response.content, guild);
                    let method: ChannelMethods;
                    if (option === 'BLOCK') method = 'BLOCK_MEMBER';
                    else method = `ADD_${option}` as ChannelMethods;
                    for (const user of members.members) await presetsManager.manage({method, member: user});
                    if (members.notFound) response.reply(memberNotFound(language));
                    if (members.members.length) {
                      response.react('✅');
                      return memberCollector.stop()
                    } else {
                      response.react('❌');
                    }
                  });
                }
                if (reaction.emoji.name === '❌') {
                  const removeMembersMessage = await replyMessage.reply(removeMember(language));
                  const memberFilter = (message: Message) => message.author.id === interaction.user.id;
                  const memberCollector = removeMembersMessage.channel.createMessageCollector({filter: memberFilter, time: 20000});
                  memberCollector.on('collect', async (response: Message) => {
                    const members = getMembersAndRoles(response.content, guild);
                    let method: ChannelMethods;
                    if (option === 'BLOCK') method = 'UNBLOCK_MEMBER';
                    else method = `REMOVE_${option}` as ChannelMethods;
                    for (const user of members.members) await presetsManager.manage({method, member: user});
                    if (members.notFound) response.reply(memberNotFound(language));
                    if (members.members.length) {
                      response.react('✅');
                      return memberCollector.stop()
                    } else {
                      response.react('❌');
                    }
                  });
                }
              });
            }
          });
        }
      },
    }));
  }
}
