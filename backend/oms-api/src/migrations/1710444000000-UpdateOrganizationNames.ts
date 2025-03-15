import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrganizationNames1710444000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 为空的name字段设置默认值
    await queryRunner.query(`
      UPDATE organizations 
      SET name = CONCAT('组织-', id) 
      WHERE name IS NULL OR name = '';
    `);
    
    // 修改name字段为非空
    await queryRunner.query(`
      ALTER TABLE organizations 
      ALTER COLUMN name SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 恢复name字段为可空
    await queryRunner.query(`
      ALTER TABLE organizations 
      ALTER COLUMN name DROP NOT NULL;
    `);
  }
} 