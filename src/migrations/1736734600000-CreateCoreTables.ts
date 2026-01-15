import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreTables1736734600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(20) NOT NULL UNIQUE,
        language VARCHAR(20) NOT NULL DEFAULT 'english',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS servers (
        server_id VARCHAR(20) PRIMARY KEY,
        language VARCHAR(20) NOT NULL DEFAULT 'english',
        category_id VARCHAR(20),
        channel_id VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(20) NOT NULL,
        stripe_subscription_id VARCHAR(100),
        stripe_customer_id VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
        current_period_end TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS voice_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id VARCHAR(20) NOT NULL UNIQUE,
        owner_id VARCHAR(20) NOT NULL,
        admin_ids TEXT[] DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_voice_rooms_channel_id ON voice_rooms(channel_id);
      CREATE INDEX IF NOT EXISTS idx_voice_rooms_owner_id ON voice_rooms(owner_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS presets (
        user_id VARCHAR(20) NOT NULL,
        guild_id VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL DEFAULT 'default',
        hide BOOLEAN NOT NULL DEFAULT FALSE,
        lock BOOLEAN NOT NULL DEFAULT FALSE,
        member_ids TEXT[] DEFAULT ARRAY[]::text[],
        admin_ids TEXT[] DEFAULT ARRAY[]::text[],
        blocked_ids TEXT[] DEFAULT ARRAY[]::text[],
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, guild_id)
      );

      CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
      CREATE INDEX IF NOT EXISTS idx_presets_guild_id ON presets(guild_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS presets;`);
    await queryRunner.query(`DROP TABLE IF EXISTS voice_rooms;`);
    await queryRunner.query(`DROP TABLE IF EXISTS subscriptions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS servers;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
