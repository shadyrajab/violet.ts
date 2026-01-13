import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultSubscription1736734900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userId = '286166598048284683';
    const subscriptionId = 'a0000000-0000-0000-0000-000000000001';
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 100);

    await queryRunner.query(`
      INSERT INTO users (user_id, language, created_at, updated_at)
      VALUES ($1, 'english', NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING;
    `, [userId]);

    await queryRunner.query(`
      INSERT INTO subscriptions (id, user_id, status, plan_type, current_period_end, created_at, updated_at)
      VALUES ($1, $2, 'active', 'premium', $3, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [subscriptionId, userId, oneYearFromNow]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userId = '286166598048284683';
    const subscriptionId = 'a0000000-0000-0000-0000-000000000001';

    await queryRunner.query(`
      DELETE FROM subscriptions WHERE id = $1;
    `, [subscriptionId]);

    await queryRunner.query(`
      DELETE FROM users WHERE user_id = $1;
    `, [userId]);
  }
}
