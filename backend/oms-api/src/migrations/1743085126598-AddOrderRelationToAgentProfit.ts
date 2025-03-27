import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderRelationToAgentProfit1743085126598 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加订单ID字段
        await queryRunner.query(`
            ALTER TABLE "agent_profits" 
            ADD COLUMN IF NOT EXISTS "order_id" INTEGER
        `);
        
        // 添加订单业务ID字段
        await queryRunner.query(`
            ALTER TABLE "agent_profits" 
            ADD COLUMN IF NOT EXISTS "order_business_id" INTEGER
        `);
            
        // 添加外键约束 - 在SQL脚本中手动执行
        // 以下语句需要管理员手动在数据库中执行，因为IF NOT EXISTS不适用于外键约束
        console.log(`
            -- 执行以下SQL添加外键约束（需要手动在数据库中执行）:
            
            -- 先尝试删除已有的约束（如果存在）
            ALTER TABLE "agent_profits" DROP CONSTRAINT IF EXISTS "FK_agent_profits_order";
            ALTER TABLE "agent_profits" DROP CONSTRAINT IF EXISTS "FK_agent_profits_order_business";
            
            -- 添加外键约束
            ALTER TABLE "agent_profits"
            ADD CONSTRAINT "FK_agent_profits_order"
            FOREIGN KEY ("order_id") 
            REFERENCES "orders"("id")
            ON DELETE CASCADE;
            
            ALTER TABLE "agent_profits"
            ADD CONSTRAINT "FK_agent_profits_order_business"
            FOREIGN KEY ("order_business_id") 
            REFERENCES "order_businesses"("id")
            ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束 - 在SQL脚本中手动执行
        console.log(`
            -- 执行以下SQL删除外键约束（需要手动在数据库中执行）:
            ALTER TABLE "agent_profits" DROP CONSTRAINT IF EXISTS "FK_agent_profits_order";
            ALTER TABLE "agent_profits" DROP CONSTRAINT IF EXISTS "FK_agent_profits_order_business";
        `);
        
        // 删除列
        await queryRunner.query(`
            ALTER TABLE "agent_profits"
            DROP COLUMN IF EXISTS "order_id",
            DROP COLUMN IF EXISTS "order_business_id"
        `);
    }

}
