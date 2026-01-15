import { singleton, inject } from 'tsyringe';
import {
  Collection,
  ChatInputCommandInteraction,
  PermissionsBitField
} from 'discord.js';
import { CommandBase, CommandPermission } from './CommandBase';
import { UserService } from '../../modules/users/services/UserService';
import { ServerService } from '../../modules/servers/services/ServerService';
import { VoiceRoomService } from '../../modules/voice/services/VoiceRoomService';
import { Logger } from '../../core/logger';
import { Locale, t, resolveLocale, DEFAULT_LOCALE } from '../../core/i18n';
import { Observability } from '../../core/observability';

@singleton()
export class CommandHandler {
  private commands: Collection<string, CommandBase> = new Collection();

  constructor(
    @inject(UserService) private userService: UserService,
    @inject(ServerService) private serverService: ServerService,
    @inject(VoiceRoomService) private voiceRoomService: VoiceRoomService,
    @inject(Logger) private logger: Logger
  ) {}

  registerCommand(command: CommandBase): void {
    this.commands.set(command.name, command);
    this.logger.info('Command registered', { commandName: command.name });
  }

  registerCommands(commands: CommandBase[]): void {
    commands.forEach(command => this.registerCommand(command));
  }

  getCommands(): CommandBase[] {
    return Array.from(this.commands.values());
  }

  async handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const transaction = Observability.startTransaction(
      `command.${interaction.commandName}`,
      'command'
    );

    try {
      Observability.setUser({
        id: interaction.user.id,
        username: interaction.user.username
      });

      if (interaction.guildId) {
        Observability.addLabels({
          guildId: interaction.guildId,
          commandName: interaction.commandName
        });
      }

      const command = this.commands.get(interaction.commandName);

      if (!command) {
        const traceIds = Observability.getTraceIds();
        this.logger.warn('Command not found', {
          action: 'command.not_found',
          command: interaction.commandName,
          userId: interaction.user.id,
          guildId: interaction.guildId || undefined,
          ...traceIds
        });
        if (transaction) transaction.end();
        return;
      }

      if (command.guildOnly && !interaction.guild) {
        await interaction.reply({
          content: 'This command can only be used in a server.',
          ephemeral: true
        });
        if (transaction) transaction.end();
        return;
      }

      const hasPermission = await this.checkPermissions(interaction, command.permissions);

      if (!hasPermission) {
        const traceIds = Observability.getTraceIds();
        this.logger.warn('Permission denied for command', {
          action: `command.${command.name}.permission_denied`,
          command: command.name,
          userId: interaction.user.id,
          guildId: interaction.guildId || undefined,
          ...traceIds
        });

        await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true
        });
        if (transaction) transaction.end();
        return;
      }

      const locale = await this.getLocale(interaction);

      await command.execute({ interaction, locale, t: (key, params) => t(key, params, locale) });

      const traceIds = Observability.getTraceIds();
      this.logger.info('Command executed successfully', {
        action: `command.${command.name}.execute`,
        command: command.name,
        userId: interaction.user.id,
        guildId: interaction.guildId || undefined,
        ...traceIds
      });

      if (transaction) transaction.end();
    } catch (error) {
      const command = this.commands.get(interaction.commandName);
      const traceIds = Observability.getTraceIds();

      Observability.captureError(error as Error, {
        commandName: interaction.commandName,
        userId: interaction.user.id,
        guildId: interaction.guildId || undefined
      });

      this.logger.error('Command execution failed', error as Error, {
        action: `command.${command?.name || interaction.commandName}.error`,
        command: command?.name || interaction.commandName,
        userId: interaction.user.id,
        guildId: interaction.guildId || undefined,
        ...traceIds
      });

      const errorMessage = 'An error occurred while executing this command.';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }

      if (transaction) transaction.end();
    }
  }

  private async checkPermissions(
    interaction: ChatInputCommandInteraction,
    permissions?: CommandPermission[]
  ): Promise<boolean> {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    for (const permission of permissions) {
      if (permission === 'TRCHANNEL_OWNER') {
        if (!interaction.guild || !interaction.member || !interaction.channel) {
          return false;
        }

        const isOwner = await this.voiceRoomService.isOwner(
          interaction.channelId,
          interaction.user.id
        );

        if (!isOwner) {
          return false;
        }
      } else if (permission === 'TRCHANNEL_ADMIN') {
        if (!interaction.guild || !interaction.member || !interaction.channel) {
          return false;
        }

        const hasPermission = await this.voiceRoomService.hasPermission(
          interaction.channelId,
          interaction.user.id
        );

        if (!hasPermission) {
          return false;
        }
      } else {
        if (!interaction.guild || !interaction.member) {
          return false;
        }

        const member = interaction.member;
        const permissionBit = PermissionsBitField.Flags[permission as keyof typeof PermissionsBitField.Flags];

        if (typeof member.permissions === 'string') {
          return false;
        }

        if (!member.permissions.has(permissionBit)) {
          return false;
        }
      }
    }

    return true;
  }

  private async getLocale(interaction: ChatInputCommandInteraction): Promise<Locale> {
    try {
      const userLocale = await this.userService.getUserLanguage(interaction.user.id);

      if (userLocale !== DEFAULT_LOCALE) {
        return userLocale;
      }

      if (interaction.guildId) {
        const serverLocale = await this.serverService.getServerLanguage(interaction.guildId);
        return serverLocale;
      }

      const discordLocale = resolveLocale(interaction.locale);
      return discordLocale;
    } catch (error) {
      this.logger.error('Failed to get locale', error as Error, {
        userId: interaction.user.id,
        guildId: interaction.guildId
      });
      return DEFAULT_LOCALE;
    }
  }
}
