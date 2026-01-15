import 'reflect-metadata';
import { container } from 'tsyringe';
import { Client, GatewayIntentBits } from 'discord.js';
import { Logger } from './logger';
import { Database } from './database';

import { User } from '../modules/users/entities/User';
import { UserRepository } from '../modules/users/repositories/UserRepository';
import { UserService } from '../modules/users/services/UserService';

import { Server } from '../modules/servers/entities/Server';
import { ServerRepository } from '../modules/servers/repositories/ServerRepository';
import { ServerService } from '../modules/servers/services/ServerService';

import { VoiceRoom } from '../modules/voice/entities/VoiceRoom';
import { VoiceProfile } from '../modules/voice/entities/VoiceProfile';
import { VoiceRoomRepository } from '../modules/voice/repositories/VoiceRoomRepository';
import { VoiceProfileRepository } from '../modules/voice/repositories/VoiceProfileRepository';
import { VoiceRoomService } from '../modules/voice/services/VoiceRoomService';
import { VoiceProfileService } from '../modules/voice/services/VoiceProfileService';
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

import { TheMovieDBService } from '../modules/cinema/services/TheMovieDBService';
import { CinemaSession } from '../modules/cinema/entities/CinemaSession';
import { CinemaSessionRating } from '../modules/cinema/entities/CinemaSessionRating';
import { CinemaSessionRepository } from '../modules/cinema/repositories/CinemaSessionRepository';
import { CinemaSessionRatingRepository } from '../modules/cinema/repositories/CinemaSessionRatingRepository';
import { CinemaSessionService } from '../modules/cinema/services/CinemaSessionService';

import { CommandHandler } from '../shared/discord/CommandHandler';
import { VoiceStateUpdateHandler } from '../events/VoiceStateUpdateHandler';
import { ChannelDeleteHandler } from '../events/ChannelDeleteHandler';
import { InteractionCreateHandler } from '../events/InteractionCreateHandler';
import { GuildScheduledEventHandler } from '../events/GuildScheduledEventHandler';

export async function setupContainer(): Promise<void> {
  container.registerSingleton(Logger);
  container.registerSingleton(Database);

  const database = container.resolve(Database);
  await database.initialize();

  const dataSource = database.getDataSource();

  container.registerInstance('UserRepository', dataSource.getRepository(User));
  container.registerInstance('ServerRepository', dataSource.getRepository(Server));
  container.registerInstance('VoiceRoomRepository', dataSource.getRepository(VoiceRoom));
  container.registerInstance('VoiceProfileRepository', dataSource.getRepository(VoiceProfile));
  container.registerInstance('PresetRepository', dataSource.getRepository(Preset));
  container.registerInstance('SubscriptionRepository', dataSource.getRepository(Subscription));
  container.registerInstance('UserServerSubscriptionRepository', dataSource.getRepository(UserServerSubscription));
  container.registerInstance('CinemaSessionRepository', dataSource.getRepository(CinemaSession));
  container.registerInstance('CinemaSessionRatingRepository', dataSource.getRepository(CinemaSessionRating));

  container.registerSingleton(UserRepository);
  container.registerSingleton(UserService);

  container.registerSingleton(ServerRepository);
  container.registerSingleton(ServerService);

  container.registerSingleton(VoiceRoomRepository);
  container.registerSingleton(VoiceProfileRepository);
  container.registerSingleton(VoiceRoomService);
  container.registerSingleton(VoiceProfileService);
  container.registerSingleton(VoicePermissionService);
  container.registerSingleton(VoiceChannelLogService);
  container.registerSingleton(VoiceChannelManagementService);
  container.registerSingleton(VoiceButtonHandler);

  container.registerSingleton(PresetRepository);
  container.registerSingleton(PresetService);

  container.registerSingleton(SubscriptionRepository);
  container.registerSingleton(UserServerSubscriptionRepository);
  container.registerSingleton(SubscriptionService);

  container.registerSingleton(TheMovieDBService);
  container.registerSingleton(CinemaSessionRepository);
  container.registerSingleton(CinemaSessionRatingRepository);
  container.registerSingleton(CinemaSessionService);

  const discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildScheduledEvents
    ]
  });

  container.registerInstance(Client, discordClient);

  container.registerSingleton(CommandHandler);
  container.registerSingleton(VoiceStateUpdateHandler);
  container.registerSingleton(ChannelDeleteHandler);
  container.registerSingleton(InteractionCreateHandler);
  container.registerSingleton(GuildScheduledEventHandler);
}

export { container };
