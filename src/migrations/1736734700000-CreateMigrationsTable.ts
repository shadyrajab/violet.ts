import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMigrationsTable1736734700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS migrations;
    `);
  }
}
