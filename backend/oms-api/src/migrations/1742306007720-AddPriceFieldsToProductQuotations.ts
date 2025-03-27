import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceFieldsToProductQuotations1742306007720 implements MigrationInterface {
    name = 'AddPriceFieldsToProductQuotations1742306007720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_quotations" ADD "agent_price" decimal(10,2)`);
        await queryRunner.query(`ALTER TABLE "product_quotations" ADD "sale_price" decimal(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_quotations" DROP COLUMN "sale_price"`);
        await queryRunner.query(`ALTER TABLE "product_quotations" DROP COLUMN "agent_price"`);
    }

}
