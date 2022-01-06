import { Guild, GuildMember, Role } from 'discord.js';

export function getMembersAndRoles(string: String, guild: Guild) {
  const members = [] as Array <GuildMember | Role>;
  let notFound = false;
  const match = string.match(/\d/g);
  if (!match) return { members, notFound };
  const joinedIds = match.join('');
  const ids = joinedIds.match(/.{1,18}/g);
    ids!.forEach((id) => {
      if (id.length === 18) {
        try {
          const user = guild.roles.cache.get(id) || guild.members.cache.get(id);
          if (user) members.push(user);
          else notFound = true;
        } catch (error) {}
      }
    });

    return { members, notFound };
}
