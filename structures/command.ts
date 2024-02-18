import { Client, CommandInteraction, PermissionsString } from 'discord.js';
import { CommandOptions, Language, TRoomPermission } from './types';

interface CommandData {
    client: Client;
    name: string;
    description: string;
    direct?: boolean;
    permissions?: (PermissionsString | TRoomPermission)[];
    options?: CommandOptions[];
    execute: (interaction: CommandInteraction, language: Language | string | null | undefined, reason: string) => void;
}

export class Command implements CommandData {
    constructor(private data: CommandData) {}

    execute(interaction: CommandInteraction, language: Language | string | null | undefined, reason: string): void {
        this.data.execute(interaction, language, reason);
    }

    get client(): Client {
        return this.data.client;
    }

    get name(): string {
        return this.data.name;
    }

    get description(): string {
        return this.data.description;
    }

    get direct(): boolean | undefined {
        return this.data.direct;
    }

    get permissions(): (PermissionsString | TRoomPermission)[] | undefined {
        return this.data.permissions;
    }

    get options(): CommandOptions[] | undefined {
        return this.data.options;
    }
}
