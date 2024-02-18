import { Guild, GuildMember, Role } from 'discord.js';

export function getMembersAndRoles(inputString: string, guild: Guild) {
    const membersAndRoles: Array<GuildMember | Role> = [];
    let notFound = false;

    const ids = inputString.match(/\d{18}/g) || [];

    for (const id of ids) {
        try {
            const user = guild.roles.cache.get(id) || guild.members.cache.get(id);
            if (user) {
                membersAndRoles.push(user);
            } else {
                notFound = true;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return { membersAndRoles, notFound };
}
