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
import { Language } from '../../core/types';

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
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      this.logger.warn('Command not found', { commandName: interaction.commandName });
      return;
    }

    try {
      if (command.guildOnly && !interaction.guild) {
        await interaction.reply({
          content: 'This command can only be used in a server.',
          ephemeral: true
        });
        return;
      }

      const hasPermission = await this.checkPermissions(interaction, command.permissions);

      if (!hasPermission) {
        await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true
        });
        return;
      }

      const language = await this.getLanguage(interaction);

      await command.execute({ interaction, language });

      this.logger.info('Command executed successfully', {
        commandName: command.name,
        userId: interaction.user.id,
        guildId: interaction.guildId
      });
    } catch (error) {
      this.logger.error('Command execution failed', error as Error, {
        commandName: command.name,
        userId: interaction.user.id,
        guildId: interaction.guildId
      });

      const errorMessage = 'An error occurred while executing this command.';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
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

  private async getLanguage(interaction: ChatInputCommandInteraction): Promise<Language> {
    try {
      const userLanguage = await this.userService.getUserLanguage(interaction.user.id);

      if (userLanguage !== 'english') {
        return userLanguage;
      }

      if (interaction.guildId) {
        const serverLanguage = await this.serverService.getServerLanguage(interaction.guildId);
        return serverLanguage;
      }

      return 'english';
    } catch (error) {
      this.logger.error('Failed to get language', error as Error, {
        userId: interaction.user.id,
        guildId: interaction.guildId
      });
      return 'english';
    }
  }
}
