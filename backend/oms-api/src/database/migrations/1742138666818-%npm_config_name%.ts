import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupplierIdToProductCategory1742138666818 implements MigrationInterface {
    name = 'AddSupplierIdToProductCategory1742138666818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE product_categories ADD "supplierId" int NULL`);
        await queryRunner.query(`ALTER TABLE product_categories ADD "supplierName" varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE product_categories ADD "description" varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE product_categories DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE product_categories DROP COLUMN "supplierName"`);
        await queryRunner.query(`ALTER TABLE product_categories DROP COLUMN "supplierId"`);
    }
}
