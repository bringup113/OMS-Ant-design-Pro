import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePriceFieldsFromProducts1742163297494 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 删除价格相关字段
        await queryRunner.query(`ALTER TABLE "product_items" DROP COLUMN "cost_price"`);
        await queryRunner.query(`ALTER TABLE "product_items" DROP COLUMN "selling_price"`);
        await queryRunner.query(`ALTER TABLE "product_items" DROP COLUMN "currency"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 恢复价格相关字段
        await queryRunner.query(`ALTER TABLE "product_items" ADD "currency" character varying DEFAULT 'CNY'`);
        await queryRunner.query(`ALTER TABLE "product_items" ADD "selling_price" decimal(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "product_items" ADD "cost_price" decimal(10,2) NOT NULL DEFAULT 0`);
    }

}
