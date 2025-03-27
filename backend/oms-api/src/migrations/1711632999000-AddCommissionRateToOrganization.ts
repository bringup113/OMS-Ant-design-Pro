import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommissionRateToOrganization1711632999000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查字段是否已存在
    const hasColumn = await queryRunner.hasColumn('organizations', 'commission_rate');
    
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "organizations" 
        ADD COLUMN "commission_rate" DECIMAL(5, 2) DEFAULT 0
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "organizations" 
      DROP COLUMN IF EXISTS "commission_rate"
    `);
  }
} 