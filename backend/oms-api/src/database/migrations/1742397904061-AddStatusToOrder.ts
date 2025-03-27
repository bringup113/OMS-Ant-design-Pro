import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToOrder1742397904061 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('正在执行 AddStatusToOrder 迁移 - 添加 status 字段到 orders 表');
        await queryRunner.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' NOT NULL
        `);
        console.log('成功添加 status 字段到 orders 表');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('正在回滚 AddStatusToOrder 迁移 - 删除 orders 表中的 status 字段');
        await queryRunner.query(`
            ALTER TABLE orders 
            DROP COLUMN IF EXISTS status
        `);
        console.log('成功删除 orders 表中的 status 字段');
    }

}
