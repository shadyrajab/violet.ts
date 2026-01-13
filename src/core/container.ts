import 'reflect-metadata';
import { container } from 'tsyringe';
import { Client, GatewayIntentBits } from 'discord.js';
import { Config } from './config';
import { Logger } from './logger';
import { Database } from './database';

import { User } from '../modules/users/entities/User';
import { UserRepository } from '../modules/users/repositories/UserRepository';
import { UserService } from '../modules/users/services/UserService';

import { Server } from '../modules/servers/entities/Server';
import { ServerRepository } from '../modules/servers/repositories/ServerRepository';
import { ServerService } from '../modules/servers/services/ServerService';

import { VoiceRoom } from '../modules/voice/entities/VoiceRoom';
import { VoiceRoomRepository } from '../modules/voice/repositories/VoiceRoomRepository';
import { VoiceRoomService } from '../modules/voice/services/VoiceRoomService';
import { VoicePermissionService } from '../modules/voice/services/VoicePermissionService';
import { VoiceChannelLogService } from '../modules/voice/services/VoiceChannelLogService';
import { VoiceChannelManagementService } from '../modules/voice/services/VoiceChannelManagementService';
import { VoiceButtonHandler } from '../modules/voice/services/VoiceButtonHandler';

import { Preset } from '../modules/presets/entities/Preset';
import { PresetRepository } from '../modules/presets/repositories/PresetRepository';
import { PresetService } from '../modules/presets/services/PresetService';

import { Subscription } from '../modules/subscriptions/entities/Subscription';
import { UserServerSubscription } from '../modules/subscriptions/entities/UserServerSubscription';
import { SubscriptionRepository } from '../modules/subscriptions/repositories/SubscriptionRepository';
import { UserServerSubscriptionRepository } from '../modules/subscriptions/repositories/UserServerSubscriptionRepository';
import { SubscriptionService } from '../modules/subscriptions/services/SubscriptionService';

import { CommandHandler } from '../shared/discord/CommandHandler';
import { VoiceStateUpdateHandler } from '../events/VoiceStateUpdateHandler';
import { ChannelDeleteHandler } from '../events/ChannelDeleteHandler';
import { InteractionCreateHandler } from '../events/InteractionCreateHandler';

export async function setupContainer(): Promise<void> {
  container.registerSingleton(Config);
  container.registerSingleton(Logger);
  container.registerSingleton(Database);

  const database = container.resolve(Database);
  await database.initialize();

  const dataSource = database.getDataSource();

  container.registerInstance('UserRepository', dataSource.getRepository(User));
  container.registerInstance('ServerRepository', dataSource.getRepository(Server));
  container.registerInstance('VoiceRoomRepository', dataSource.getRepository(VoiceRoom));
  container.registerInstance('PresetRepository', dataSource.getRepository(Preset));
  container.registerInstance('SubscriptionRepository', dataSource.getRepository(Subscription));
  container.registerInstance('UserServerSubscriptionRepository', dataSource.getRepository(UserServerSubscription));

  container.registerSingleton(UserRepository);
  container.registerSingleton(UserService);

  container.registerSingleton(ServerRepository);
  container.registerSingleton(ServerService);

  container.registerSingleton(VoiceRoomRepository);
  container.registerSingleton(VoiceRoomService);
  container.registerSingleton(VoicePermissionService);
  container.registerSingleton(VoiceChannelLogService);
  container.registerSingleton(VoiceChannelManagementService);
  container.registerSingleton(VoiceButtonHandler);

  container.registerSingleton(PresetRepository);
  container.registerSingleton(PresetService);

  container.registerSingleton(SubscriptionRepository);
  container.registerSingleton(UserServerSubscriptionRepository);
  container.registerSingleton(SubscriptionService);

  const discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages
    ]
  });

  container.registerInstance(Client, discordClient);

  container.registerSingleton(CommandHandler);
  container.registerSingleton(VoiceStateUpdateHandler);
  container.registerSingleton(ChannelDeleteHandler);
  container.registerSingleton(InteractionCreateHandler);
}

export { container };
