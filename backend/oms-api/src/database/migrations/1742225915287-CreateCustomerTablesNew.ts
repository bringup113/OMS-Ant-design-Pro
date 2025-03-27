import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerTablesNew1742225915287 implements MigrationInterface {
    name = 'CreateCustomerTablesNew1742225915287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 不再尝试创建已经存在的表
        console.log('Migration skipped: tables already exist');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 什么也不做，因为我们没有创建表
        console.log('Migration down skipped');
    }
}
