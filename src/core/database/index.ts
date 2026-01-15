import { DataSource } from 'typeorm';
import { singleton, inject } from 'tsyringe';
import { envs } from '../config';
import { Logger } from '../logger';

import { User } from '../../modules/users/entities/User';
import { Server } from '../../modules/servers/entities/Server';
import { VoiceRoom } from '../../modules/voice/entities/VoiceRoom';
import { VoiceProfile } from '../../modules/voice/entities/VoiceProfile';
import { Preset } from '../../modules/presets/entities/Preset';
import { Subscription } from '../../modules/subscriptions/entities/Subscription';
import { UserServerSubscription } from '../../modules/subscriptions/entities/UserServerSubscription';
import { CinemaSession } from '../../modules/cinema/entities/CinemaSession';
import { CinemaSessionRating } from '../../modules/cinema/entities/CinemaSessionRating';

import { CreateCoreTables1736734600000 } from '../../migrations/1736734600000-CreateCoreTables';
import { CreateMigrationsTable1736734700000 } from '../../migrations/1736734700000-CreateMigrationsTable';
import { CreateVoiceProfiles1736734800000 } from '../../migrations/1736734800000-CreateVoiceProfiles';
import { SeedDefaultSubscription1736734900000 } from '../../migrations/1736734900000-SeedDefaultSubscription';
import { CreateUserServerSubscriptions1736735000000 } from '../../migrations/1736735000000-CreateUserServerSubscriptions';
import { CreateCinemaTables1736735100000 } from '../../migrations/1736735100000-CreateCinemaTables';

@singleton()
export class Database {
  private dataSource!: DataSource;

  constructor(
    @inject(Logger) private logger: Logger
  ) {}

  async initialize(): Promise<void> {
    try {
      this.dataSource = new DataSource({
        type: 'postgres',
        host: envs.DB_HOST || 'localhost',
        port: parseInt(envs.DB_PORT || '5432', 10),
        database: envs.DB_NAME || 'violet',
        username: envs.DB_USER || 'postgres',
        password: envs.DB_PASSWORD || '',
        entities: [
          User,
          Server,
          VoiceRoom,
          VoiceProfile,
          Preset,
          Subscription,
          UserServerSubscription,
          CinemaSession,
          CinemaSessionRating
        ],
        migrations: [
          CreateCoreTables1736734600000,
          CreateMigrationsTable1736734700000,
          CreateVoiceProfiles1736734800000,
          SeedDefaultSubscription1736734900000,
          CreateUserServerSubscriptions1736735000000,
          CreateCinemaTables1736735100000
        ],
        migrationsRun: true,
        synchronize: false,
        logging: envs.NODE_ENV === 'development',
        maxQueryExecutionTime: 1000
      });

      await this.dataSource.initialize();
      this.logger.info('Database connected successfully');

      await this.dataSource.runMigrations();
      this.logger.info('Database migrations executed successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error as Error);
      throw error;
    }
  }

  getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('DataSource is not initialized. Call initialize() first.');
    }
    return this.dataSource;
  }

  async close(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.logger.info('Database connection closed');
    }
  }
}
