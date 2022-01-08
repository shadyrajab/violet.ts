import {Client, MessageEmbed} from 'discord.js';
import fetch from 'cross-fetch';
import {Command} from '../../structures/structures/command';
import {format} from '../../utils/formatFunctions';
import {minecraftProfile, headCommand, historyName} from '../../translations/minecraft/mcprofileMessages';
import {userNotFound} from '../../translations/globalMessages';

export class MinecraftProfile extends Command {
  constructor(client: Client) {
    super(new Command({
      client,

      name: 'minecraftprofile',
      description: 'Minecraft • Display a Minecraft user profile.',
      direct: true,
      options: [{
        name: 'nickname',
        description: 'The profile nickname.',
        required: true,
        type: 'STRING',
      }],

      execute: async (interaction, language) => {
        const username = interaction.options.getString('nickname') as string;
        const request = fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        const response = await request;
        if (response.status === 200) {
          const user = await response.json();
          const secondRequest = fetch(`https://api.mojang.com/user/profiles/${user.id}/names`);
          const secondResponse = await secondRequest;
          let nameHistory = ''; let data = ''; let
            time = '';
          const names = await secondResponse.json();
          names.reverse();
          for (const [index, name] of names.entries()) {
            nameHistory += `**${index + 1} - ** ${name.name.replace('_', '\\_')} \n`;
            if (name.changedToAt !== undefined) {
              const date = new Date(name.changedToAt);
              data += `${format(date.getDate())}/${format(date.getMonth() + 1)}/${date.getFullYear()} \n`;
              time += `${format(date.getHours())}:${format(date.getMinutes())}:${format(date.getSeconds())} \n`;
            }
          }
          const avatar = `https://crafatar.com/avatars/${user.id}?overlay`;
          const skin = `https://crafatar.com/skins/${user.id}`;
          const skinRender = `https://crafatar.com/renders/body/${user.id}?overlay`;
          const embed = new MessageEmbed()
              .setThumbnail(skinRender)
              .setDescription(minecraftProfile(language))
              .setColor(0x2f3136)
              .setAuthor({name: user.name, iconURL: avatar})
              .addField('UUID', user.id)
              .addField('Skin', `[Baixar Skin](${skin})`)
              .addField(historyName(language), nameHistory, true);
          if (data && time) {
            embed.addField('\u200B', data, true);
            embed.addField('\u200B', time, true);
          }
          embed.addField(headCommand(language), `**1.13+**\n/give @p minecraft:player_head{SkullOwner:"${user.name}"}\n**1.12-**\n/give @p minecraft:skull 1 3 {SkullOwner:"${user.name}"}`);
          embed.setTimestamp(Date.now());
          interaction.reply({embeds: [embed]});
        } else {
          interaction.reply({
            content: userNotFound(language, username),
            ephemeral: true,
          });
        }
      },
    }));
  }
}
