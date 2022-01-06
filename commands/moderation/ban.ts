import {
  Client, Guild, GuildMember, Message, MessageEmbed, User,
} from 'discord.js';
import { ProfileManager } from '../../structures/managers/profileManager';
import { Command } from '../../structures/structures/command';
import {
  punishClient,
  punishHerself,
  higherRole,
  lesserRole,
  reasonn,
  soIsThat,
  time,
} from '../../translations/moderation/globalMessages';
import { bannedBy, bannedFrom, banMessage } from '../../translations/moderation/banMessages';

export class Ban extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'ban',
      description: 'Moderation • Ban one or two users.',
      permissions: ['BAN_MEMBERS'],
      options: [{
        name: 'user',
        description: 'The user or user ID.',
        required: true,
        type: 'USER',
      }, {
        name: 'user2',
        description: 'The other user that you want to ban.',
        required: false,
        type: 'USER',
      }, {
        name: 'reason',
        description: 'The reason of the banishment.',
        required: false,
        type: 'STRING',
      }, {
        name: 'notify',
        description: 'If you want to notify the punished user.',
        required: false,
        type: 'BOOLEAN',
      }, {
        name: 'days',
        description: 'Number of days of messages to delete.',
        required: false,
        type: 'NUMBER',
      }],

      execute: async (interaction, language) => {
        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;
        const guildOwner = await guild.fetchOwner();
        const reason = interaction.options.getString('reason') || '';
        const days = interaction.options.getNumber('days') || 0;
        const notify = interaction.options.getBoolean('notify');
        const firstUser = interaction.options.getUser('user')!;
        const secondUser = interaction.options.getUser('user2');
        const firstMember = guild.members.cache.get(firstUser.id);
        const secondMember = (secondUser) ? guild.members.cache.get(secondUser.id) : null;
        const clientMember = await guild.members.fetch(interaction.client.user!.id);
        const fmHighestRolePosition = (firstMember) ? firstMember.roles.highest.position : 0;
        const smHighestRolePosition = (secondMember) ? secondMember.roles.highest.position : 0;
        const clientHighestRolePosition = clientMember.roles.highest.position;
        const authorHighestRolePosition = member.roles.highest.position;
        if (firstMember === clientMember || secondMember === clientMember) {
          return interaction.reply({
            content: punishClient(language),
            ephemeral: true,
          });
        }
        if (firstMember === interaction.member || secondMember === interaction.member) {
          interaction.reply({
            content: punishHerself(language),
            ephemeral: true,
          });
          const filter = (message: Message) => message.author === interaction.user;
          const dmChannel = await interaction.user.createDM();
          const collector = dmChannel.createMessageCollector({ filter, time: 60000 });
          return collector.on('collect', async (message) => {
            collector.stop();
            await message.reply(soIsThat(language));
            const profileManager = new ProfileManager(interaction.user);
            await profileManager.addBadge("Violet's Best Friend <3", message, interaction.user, language, this.client);
          });
        }
        if ((fmHighestRolePosition >= authorHighestRolePosition || smHighestRolePosition >= authorHighestRolePosition) && interaction.member !== guildOwner) {
          return interaction.reply({
            content: higherRole(language),
            ephemeral: true,
          });
        }
        if (fmHighestRolePosition >= clientHighestRolePosition || smHighestRolePosition >= clientHighestRolePosition) {
          return interaction.reply({
            content: lesserRole(language),
            ephemeral: true,
          });
        }
        function embed(user: User) {
          const embed = new MessageEmbed()
            .setTitle(bannedFrom(language, guild.name))
            .setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setColor(0x2f3136)
            .setThumbnail(guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/ZeNkX0r.png')
            .addField(bannedBy(language), `${interaction.user}`, true)
            .addField(reasonn(language), reason, true)
            .addField(time(language), 'Permanently', false)
            .setTimestamp(Date.now());
          return embed;
        }
        if (notify) try { await firstUser.send({ embeds: [embed(firstUser)] }); } catch (err) {}
        guild.bans.create(firstUser, { reason: `Banned by: ${interaction.user.username} | Time: Permanently | Reason: ${reason}`, days });
        if (secondUser) {
          if (notify) try { await secondUser.send({ embeds: [embed(secondUser)] }); } catch (err) {}
          guild.bans.create(secondUser, { reason: `Banned by: ${interaction.user.username} | Time: Permanently | Reason: ${reason}`, days });
        }
        interaction.reply({
          content: banMessage(language, firstUser, secondUser, reason),
          ephemeral: true,
        });
      },
    }));
  }
}
