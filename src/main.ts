import './core/apm';
import 'reflect-metadata';
import { Client } from 'discord.js';
import { setupContainer, container } from './core/container';
import { Logger } from './core/logger';
import { envs } from './core/config';
import { CommandHandler } from './shared/discord/CommandHandler';
import { VoiceStateUpdateHandler } from './events/VoiceStateUpdateHandler';
import { ChannelDeleteHandler } from './events/ChannelDeleteHandler';
import { InteractionCreateHandler } from './events/InteractionCreateHandler';
import { GuildCreateHandler } from './events/GuildCreateHandler';

import { PresetsCommand } from './modules/presets/commands/PresetsCommand';
import { SetupCommand } from './modules/voice/commands/SetupCommand';
import { DisableCommand } from './modules/voice/commands/DisableCommand';
import { ProfilesCommand } from './modules/voice/commands/ProfilesCommand';
import { AddCommand } from './modules/voice/commands/AddCommand';
import { BlockCommand } from './modules/voice/commands/BlockCommand';
import { HideCommand } from './modules/voice/commands/HideCommand';
import { LockCommand } from './modules/voice/commands/LockCommand';
import { RemoveAdminCommand } from './modules/voice/commands/RemoveAdminCommand';
import { RemoveCommand } from './modules/voice/commands/RemoveCommand';
import { RenameCommand } from './modules/voice/commands/RenameCommand';
import { SetAdminCommand } from './modules/voice/commands/SetAdminCommand';
import { UnblockCommand } from './modules/voice/commands/UnblockCommand';
import { UnhideCommand } from './modules/voice/commands/UnhideCommand';
import { UnlockCommand } from './modules/voice/commands/UnlockCommand';
import { LinkPremiumCommand } from './modules/subscriptions/commands/LinkPremiumCommand';

async function bootstrap() {
  try {
    await setupContainer();

    const logger = container.resolve(Logger);
    const client = container.resolve(Client);
    const commandHandler = container.resolve(CommandHandler);

    const voiceStateUpdateHandler = container.resolve(VoiceStateUpdateHandler);
    const channelDeleteHandler = container.resolve(ChannelDeleteHandler);
    const interactionCreateHandler = container.resolve(InteractionCreateHandler);
    const guildCreateHandler = container.resolve(GuildCreateHandler);

    const commands = [
      container.resolve(PresetsCommand),
      container.resolve(SetupCommand),
      container.resolve(DisableCommand),
      container.resolve(ProfilesCommand),
      container.resolve(AddCommand),
      container.resolve(BlockCommand),
      container.resolve(HideCommand),
      container.resolve(LockCommand),
      container.resolve(RemoveAdminCommand),
      container.resolve(RemoveCommand),
      container.resolve(RenameCommand),
      container.resolve(SetAdminCommand),
      container.resolve(UnblockCommand),
      container.resolve(UnhideCommand),
      container.resolve(UnlockCommand),
      container.resolve(LinkPremiumCommand),
    ];

    commandHandler.registerCommands(commands);

    voiceStateUpdateHandler.setup(client);
    channelDeleteHandler.setup(client);
    interactionCreateHandler.setup(client);
    guildCreateHandler.setup(client);

    client.on('ready', () => {
      logger.info('Bot is ready', {
        username: client.user?.username,
        id: client.user?.id,
      });
    });

    await client.login(envs.TOKEN);

    logger.info('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
