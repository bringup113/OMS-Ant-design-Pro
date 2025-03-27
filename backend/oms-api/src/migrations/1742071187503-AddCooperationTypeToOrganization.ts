import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCooperationTypeToOrganization1742071187503 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加cooperation_type字段
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "cooperation_type" varchar DEFAULT 'no_commission'`,
    );

    // 为现有的子供应商设置默认值
    await queryRunner.query(`
      UPDATE "organizations" 
      SET "cooperation_type" = 'no_commission' 
      WHERE "parent_id" IN (
        SELECT "id" FROM "organizations" WHERE "type" = 'supplier'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "cooperation_type"`);
  }
} 