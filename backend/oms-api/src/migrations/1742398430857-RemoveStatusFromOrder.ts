import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStatusFromOrder1742398430857 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('正在执行 RemoveStatusFromOrder 迁移 - 移除 orders 表中的 status 字段');
        await queryRunner.query(`
            ALTER TABLE orders 
            DROP COLUMN IF EXISTS status
        `);
        console.log('成功移除 orders 表中的 status 字段');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('正在回滚 RemoveStatusFromOrder 迁移 - 添加 status 字段到 orders 表');
        await queryRunner.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' NOT NULL
        `);
        console.log('成功添加 status 字段回 orders 表');
    }

}
