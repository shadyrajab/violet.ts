import 'reflect-metadata';
import { config } from 'dotenv';
import { Client } from 'discord.js';
import { setupContainer, container } from './core/container';
import { Logger } from './core/logger';
import { Config } from './core/config';
import { CommandHandler } from './shared/discord/CommandHandler';
import { VoiceStateUpdateHandler } from './events/VoiceStateUpdateHandler';
import { ChannelDeleteHandler } from './events/ChannelDeleteHandler';
import { InteractionCreateHandler } from './events/InteractionCreateHandler';

import { TRSetupCommand } from './modules/configuration/commands/TRSetupCommand';
import { TRDisableCommand } from './modules/configuration/commands/TRDisableCommand';
import { PresetsCommand } from './modules/presets/commands/PresetsCommand';
import { TRAddCommand } from './modules/voice/commands/TRAddCommand';
import { TRBlockCommand } from './modules/voice/commands/TRBlockCommand';
import { TRHideCommand } from './modules/voice/commands/TRHideCommand';
import { TRLockCommand } from './modules/voice/commands/TRLockCommand';
import { TRRemoveAdminCommand } from './modules/voice/commands/TRRemoveAdminCommand';
import { TRRemoveCommand } from './modules/voice/commands/TRRemoveCommand';
import { TRRenameCommand } from './modules/voice/commands/TRRenameCommand';
import { TRSetAdminCommand } from './modules/voice/commands/TRSetAdminCommand';
import { TRUnblockCommand } from './modules/voice/commands/TRUnblockCommand';
import { TRUnhideCommand } from './modules/voice/commands/TRUnhideCommand';
import { TRUnlockCommand } from './modules/voice/commands/TRUnlockCommand';

config();

async function bootstrap() {
  try {
    await setupContainer();

    const logger = container.resolve(Logger);
    const appConfig = container.resolve(Config);
    const client = container.resolve(Client);
    const commandHandler = container.resolve(CommandHandler);

    const voiceStateUpdateHandler = container.resolve(VoiceStateUpdateHandler);
    const channelDeleteHandler = container.resolve(ChannelDeleteHandler);
    const interactionCreateHandler = container.resolve(InteractionCreateHandler);

    const commands = [
      container.resolve(TRSetupCommand),
      container.resolve(TRDisableCommand),
      container.resolve(PresetsCommand),
      container.resolve(TRAddCommand),
      container.resolve(TRBlockCommand),
      container.resolve(TRHideCommand),
      container.resolve(TRLockCommand),
      container.resolve(TRRemoveAdminCommand),
      container.resolve(TRRemoveCommand),
      container.resolve(TRRenameCommand),
      container.resolve(TRSetAdminCommand),
      container.resolve(TRUnblockCommand),
      container.resolve(TRUnhideCommand),
      container.resolve(TRUnlockCommand),
    ];

    commandHandler.registerCommands(commands);

    voiceStateUpdateHandler.setup(client);
    channelDeleteHandler.setup(client);
    interactionCreateHandler.setup(client);

    client.on('ready', () => {
      logger.info('Bot is ready', {
        username: client.user?.username,
        id: client.user?.id,
      });
    });

    await client.login(appConfig.discord.token);

    logger.info('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
