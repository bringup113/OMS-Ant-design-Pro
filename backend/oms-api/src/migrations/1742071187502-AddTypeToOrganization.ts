import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToOrganization1742071187502 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加type字段
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "type" varchar DEFAULT 'customer'`,
    );

    // 将ID为2的组织设置为supplier类型
    await queryRunner.query(
      `UPDATE "organizations" SET "type" = 'supplier' WHERE "id" = 2`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "type"`);
  }
} 