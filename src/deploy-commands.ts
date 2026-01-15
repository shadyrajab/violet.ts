import 'reflect-metadata';
import { REST, Routes } from 'discord.js';
import { setupContainer, container } from './core/container';
import { Logger } from './core/logger';
import { envs } from './core/config';

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

async function deployCommands() {
  try {
    await setupContainer();

    const logger = container.resolve(Logger);

    console.log('Deploying Discord slash commands globally...');
    console.log(`Application ID: ${envs.CLIENT_ID}`);

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
    ];

    const commandData = commands.map(cmd => cmd.buildCommand().toJSON());

    console.log(`📦 Total commands to deploy: ${commandData.length}`);
    console.log('Commands:', commandData.map(c => c.name).join(', '));

    const rest = new REST().setToken(envs.TOKEN);

    logger.info('Deploying application commands globally...');

    await rest.put(
      Routes.applicationCommands(envs.CLIENT_ID),
      { body: commandData }
    );

    console.log('Successfully deployed all commands globally!');
    console.log('Commands may take up to 1 hour to appear globally.');
    console.log('Tip: Use guild commands for instant updates during development.');

    logger.info('Successfully deployed application commands globally', {
      count: commandData.length,
      commands: commandData.map(c => c.name)
    });

    process.exit(0);
  } catch (error) {
    console.error('Failed to deploy commands:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check that TOKEN is valid in .env');
    console.error('2. Check that CLIENT_ID is set in .env');
    console.error('3. Ensure bot has applications.commands scope');
    process.exit(1);
  }
}

deployCommands();
