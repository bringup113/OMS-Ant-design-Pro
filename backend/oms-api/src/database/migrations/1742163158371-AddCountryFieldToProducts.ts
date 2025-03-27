import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryFieldToProducts1742163158371 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加country字段
        await queryRunner.query(`ALTER TABLE "product_items" ADD "country" character varying`);
        
        // 删除supplier_id字段
        await queryRunner.query(`ALTER TABLE "product_items" DROP CONSTRAINT IF EXISTS "FK_product_items_supplier_id"`);
        await queryRunner.query(`ALTER TABLE "product_items" DROP COLUMN "supplier_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 恢复supplier_id字段
        await queryRunner.query(`ALTER TABLE "product_items" ADD "supplier_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_items" ADD CONSTRAINT "FK_product_items_supplier_id" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // 删除country字段
        await queryRunner.query(`ALTER TABLE "product_items" DROP COLUMN "country"`);
    }

}
