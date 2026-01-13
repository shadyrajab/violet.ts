import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVoiceProfiles1736734800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS voice_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guild_id VARCHAR(20) NOT NULL,
        owner_id VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        category_id VARCHAR(20) NOT NULL,
        join_channel_id VARCHAR(20) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, name)
      );

      CREATE INDEX IF NOT EXISTS idx_voice_profiles_guild ON voice_profiles(guild_id);
      CREATE INDEX IF NOT EXISTS idx_voice_profiles_owner ON voice_profiles(owner_id);
      CREATE INDEX IF NOT EXISTS idx_voice_profiles_join_channel ON voice_profiles(join_channel_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_voice_profiles_join_channel;
      DROP INDEX IF EXISTS idx_voice_profiles_owner;
      DROP INDEX IF EXISTS idx_voice_profiles_guild;
      DROP TABLE IF EXISTS voice_profiles;
    `);
  }
}
