import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCinemaTables1736735100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cinema_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guild_id VARCHAR(20) NOT NULL,
        tmdb_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        poster_path VARCHAR(255),
        runtime INTEGER NOT NULL,
        channel_id VARCHAR(20) NOT NULL,
        event_id VARCHAR(20),
        hosted_by VARCHAR(20) NOT NULL,
        scheduled_start TIMESTAMP NOT NULL,
        scheduled_end TIMESTAMP NOT NULL,
        attendees TEXT[] DEFAULT '{}',
        status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cinema_sessions_guild ON cinema_sessions(guild_id);
      CREATE INDEX IF NOT EXISTS idx_cinema_sessions_status ON cinema_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_cinema_sessions_scheduled ON cinema_sessions(scheduled_start);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cinema_session_ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES cinema_sessions(id) ON DELETE CASCADE,
        user_id VARCHAR(20) NOT NULL,
        rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_cinema_ratings_session ON cinema_session_ratings(session_id);
    `);

    await queryRunner.query(`
      ALTER TABLE voice_profiles
      ADD COLUMN IF NOT EXISTS profile_type VARCHAR(20) NOT NULL DEFAULT 'voice';
    `);

    await queryRunner.query(`
      ALTER TABLE voice_profiles
      ALTER COLUMN join_channel_id DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE voice_profiles DROP COLUMN IF EXISTS profile_type;`);
    await queryRunner.query(`DROP TABLE IF EXISTS cinema_session_ratings;`);
    await queryRunner.query(`DROP TABLE IF EXISTS cinema_sessions;`);
  }
}
