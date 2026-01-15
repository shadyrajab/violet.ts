import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  PermissionsBitField
} from 'discord.js';
import { Locale, t } from '../../core/i18n';

export type CommandPermission = 'TRCHANNEL_OWNER' | 'TRCHANNEL_ADMIN' | keyof typeof PermissionsBitField.Flags;

export interface CommandExecuteContext {
  interaction: ChatInputCommandInteraction;
  locale: Locale;
  t: typeof t;
}

export abstract class CommandBase {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly permissions?: CommandPermission[];
  abstract readonly guildOnly: boolean;

  abstract buildCommand(): SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

  abstract execute(context: CommandExecuteContext): Promise<void>;

  handleAutocomplete?(interaction: AutocompleteInteraction): Promise<void>;

  toJSON(): unknown {
    return this.buildCommand().toJSON();
  }
}
