import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommissionFieldsToSupplierProfit1743080822077 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查字段是否已存在
        const hasCommissionRateColumn = await queryRunner.hasColumn('supplier_profits', 'commission_rate');
        const hasCommissionColumn = await queryRunner.hasColumn('supplier_profits', 'commission');
        const hasIsAgentOrderColumn = await queryRunner.hasColumn('supplier_profits', 'is_agent_order');
        
        // 添加佣金比例字段
        if (!hasCommissionRateColumn) {
            await queryRunner.query(`
                ALTER TABLE "supplier_profits" 
                ADD COLUMN "commission_rate" DECIMAL(5, 2) DEFAULT 0
            `);
        }
        
        // 添加佣金金额字段
        if (!hasCommissionColumn) {
            await queryRunner.query(`
                ALTER TABLE "supplier_profits" 
                ADD COLUMN "commission" DECIMAL(10, 2) DEFAULT 0
            `);
        }
        
        // 添加是否代理订单字段
        if (!hasIsAgentOrderColumn) {
            await queryRunner.query(`
                ALTER TABLE "supplier_profits" 
                ADD COLUMN "is_agent_order" BOOLEAN DEFAULT false
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "supplier_profits" 
            DROP COLUMN IF EXISTS "commission_rate",
            DROP COLUMN IF EXISTS "commission",
            DROP COLUMN IF EXISTS "is_agent_order"
        `);
    }

}
