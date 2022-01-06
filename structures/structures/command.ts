import { Client, CommandInteraction, PermissionString } from 'discord.js';
import { CommandOptions, Language, TRoomPermission } from './types';

interface CommandData {
    client: Client

    name: string
    description: string
    direct?: boolean
    permissions?: Array <PermissionString | TRoomPermission>
    options?: Array <CommandOptions>

    execute: (interaction: CommandInteraction, language: Language) => void
}

export class Command implements CommandData {
  public client: Client;

  public name: string;

  public description: string;

  public direct?: boolean;

  public permissions?: Array <PermissionString | TRoomPermission>;

  public options?: Array <CommandOptions>;

  public execute: (interaction: CommandInteraction, language: Language) => void;

  constructor({
    client, name, description, direct, permissions, options, execute,
  }: CommandData) {
    this.client = client;

    this.name = name;
    this.description = description;
    this.direct = direct;
    this.permissions = permissions;
    this.options = options;

    this.execute = execute;
  }
}
