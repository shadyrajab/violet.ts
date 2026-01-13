import { DataSource } from 'typeorm';
import { singleton, inject } from 'tsyringe';
import { Config } from '../config';
import { Logger } from '../logger';

import { User } from '../../modules/users/entities/User';
import { Server } from '../../modules/servers/entities/Server';
import { VoiceRoom } from '../../modules/voice/entities/VoiceRoom';
import { VoiceProfile } from '../../modules/voice/entities/VoiceProfile';
import { Preset } from '../../modules/presets/entities/Preset';
import { Subscription } from '../../modules/subscriptions/entities/Subscription';
import { UserServerSubscription } from '../../modules/subscriptions/entities/UserServerSubscription';

import { CreateMigrationsTable1736734700000 } from '../../migrations/1736734700000-CreateMigrationsTable';
import { CreateVoiceProfiles1736734800000 } from '../../migrations/1736734800000-CreateVoiceProfiles';
import { SeedDefaultSubscription1736734900000 } from '../../migrations/1736734900000-SeedDefaultSubscription';

@singleton()
export class Database {
  private dataSource!: DataSource;

  constructor(
    @inject(Config) private config: Config,
    @inject(Logger) private logger: Logger
  ) {}

  async initialize(): Promise<void> {
    try {
      this.dataSource = new DataSource({
        type: 'postgres',
        host: this.config.database.host,
        port: this.config.database.port,
        database: this.config.database.database,
        username: this.config.database.user,
        password: this.config.database.password,
        entities: [
          User,
          Server,
          VoiceRoom,
          VoiceProfile,
          Preset,
          Subscription,
          UserServerSubscription
        ],
        migrations: [
          CreateMigrationsTable1736734700000,
          CreateVoiceProfiles1736734800000,
          SeedDefaultSubscription1736734900000
        ],
        migrationsRun: true,
        synchronize: false,
        logging: this.config.app.environment === 'development',
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
