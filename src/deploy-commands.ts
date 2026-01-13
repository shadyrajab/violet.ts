import 'reflect-metadata';
import { config } from 'dotenv';
import { REST, Routes } from 'discord.js';
import { setupContainer, container } from './core/container';
import { Logger } from './core/logger';
import { Config } from './core/config';

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

async function deployCommands() {
  try {
    await setupContainer();

    const logger = container.resolve(Logger);
    const appConfig = container.resolve(Config);

    console.log('🚀 Deploying Discord slash commands globally...');
    console.log(`📋 Application ID: ${appConfig.discord.clientId}`);

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

    const commandData = commands.map(cmd => cmd.buildCommand().toJSON());

    console.log(`📦 Total commands to deploy: ${commandData.length}`);
    console.log('Commands:', commandData.map(c => c.name).join(', '));

    const rest = new REST().setToken(appConfig.discord.token);

    logger.info('Deploying application commands globally...');

    await rest.put(
      Routes.applicationCommands(appConfig.discord.clientId),
      { body: commandData }
    );

    console.log('✅ Successfully deployed all commands globally!');
    console.log('⏰ Commands may take up to 1 hour to appear globally.');
    console.log('💡 Tip: Use guild commands for instant updates during development.');

    logger.info('Successfully deployed application commands globally', {
      count: commandData.length,
      commands: commandData.map(c => c.name)
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check that TOKEN is valid in .env');
    console.error('2. Check that CLIENT_ID is set in .env (your application ID from Discord Developer Portal)');
    console.error('3. Ensure bot has applications.commands scope');
    process.exit(1);
  }
}

deployCommands();
