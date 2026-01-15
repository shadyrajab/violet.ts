import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserServerSubscriptions1736735000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_server_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(20) NOT NULL,
        server_id VARCHAR(20) NOT NULL,
        subscription_id UUID NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_user_server_subscriptions_user_id ON user_server_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_server_subscriptions_server_id ON user_server_subscriptions(server_id);
      CREATE INDEX IF NOT EXISTS idx_user_server_subscriptions_subscription_id ON user_server_subscriptions(subscription_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_server_unique ON user_server_subscriptions(user_id, server_id) WHERE is_active = TRUE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_server_subscriptions;`);
  }
}
