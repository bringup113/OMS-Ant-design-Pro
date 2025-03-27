import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionValueField1743800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查字段是否已存在
        const hasColumn = await queryRunner.hasColumn('permissions', 'permission_value');
        
        if (!hasColumn) {
            // 添加 permission_value 字段
            await queryRunner.query(`
                ALTER TABLE "permissions"
                ADD COLUMN IF NOT EXISTS "permission_value" INTEGER DEFAULT 0
            `);
            
            console.log('已添加 permission_value 字段到 permissions 表');
        } else {
            console.log('permission_value 字段已存在，跳过');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 检查字段是否存在
        const hasColumn = await queryRunner.hasColumn('permissions', 'permission_value');
        
        if (hasColumn) {
            // 删除 permission_value 字段
            await queryRunner.query(`
                ALTER TABLE "permissions"
                DROP COLUMN IF EXISTS "permission_value"
            `);
            
            console.log('已删除 permission_value 字段');
        }
    }
} 