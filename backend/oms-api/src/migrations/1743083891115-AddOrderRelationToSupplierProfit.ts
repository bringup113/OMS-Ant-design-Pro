import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderRelationToSupplierProfit1743083891115 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查字段是否已存在
        const hasOrderIdColumn = await queryRunner.hasColumn('supplier_profits', 'order_id');
        const hasOrderBusinessIdColumn = await queryRunner.hasColumn('supplier_profits', 'order_business_id');
        
        // 添加订单ID字段
        if (!hasOrderIdColumn) {
            await queryRunner.query(`
                ALTER TABLE "supplier_profits" 
                ADD COLUMN "order_id" INTEGER
            `);
            
            // 添加外键约束
            await queryRunner.query(`
                ALTER TABLE "supplier_profits"
                ADD CONSTRAINT "FK_supplier_profits_order"
                FOREIGN KEY ("order_id") 
                REFERENCES "orders"("id")
                ON DELETE CASCADE
            `);
        }
        
        // 添加订单业务ID字段
        if (!hasOrderBusinessIdColumn) {
            await queryRunner.query(`
                ALTER TABLE "supplier_profits" 
                ADD COLUMN "order_business_id" INTEGER
            `);
            
            // 添加外键约束
            await queryRunner.query(`
                ALTER TABLE "supplier_profits"
                ADD CONSTRAINT "FK_supplier_profits_order_business"
                FOREIGN KEY ("order_business_id") 
                REFERENCES "order_businesses"("id")
                ON DELETE CASCADE
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        await queryRunner.query(`
            ALTER TABLE "supplier_profits"
            DROP CONSTRAINT IF EXISTS "FK_supplier_profits_order_business"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "supplier_profits"
            DROP CONSTRAINT IF EXISTS "FK_supplier_profits_order"
        `);
        
        // 删除列
        await queryRunner.query(`
            ALTER TABLE "supplier_profits"
            DROP COLUMN IF EXISTS "order_business_id",
            DROP COLUMN IF EXISTS "order_id"
        `);
    }

}
