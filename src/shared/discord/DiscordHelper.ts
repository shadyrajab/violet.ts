import { Guild, GuildMember, Role } from 'discord.js';

export class DiscordHelper {
  static async fetchMembersAndRoles(
    inputString: string,
    guild: Guild
  ): Promise<{ members: (GuildMember | Role)[]; notFound: boolean }> {
    const idPattern = /\d{18,}/g;
    const ids = inputString.match(idPattern) || [];

    const members: (GuildMember | Role)[] = [];
    let notFound = false;

    for (const id of ids) {
      try {
        const role = guild.roles.cache.get(id);
        if (role) {
          members.push(role);
          continue;
        }

        const member = await guild.members.fetch(id).catch(() => null);
        if (member) {
          members.push(member);
        } else {
          notFound = true;
        }
      } catch {
        notFound = true;
      }
    }

    return { members, notFound };
  }

  static extractUserIds(inputString: string): string[] {
    const idPattern = /\d{18,}/g;
    return inputString.match(idPattern) || [];
  }

  static async fetchMember(guild: Guild, userId: string): Promise<GuildMember | null> {
    try {
      return await guild.members.fetch(userId);
    } catch {
      return null;
    }
  }

  static async fetchRole(guild: Guild, roleId: string): Promise<Role | null> {
    try {
      return guild.roles.cache.get(roleId) || null;
    } catch {
      return null;
    }
  }
}
