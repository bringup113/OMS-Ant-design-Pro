import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAgentProfitFields1711632999001 implements MigrationInterface {
    name = 'RemoveAgentProfitFields1711632999001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 删除不需要的字段
        await queryRunner.query(`ALTER TABLE "agent_profits" DROP COLUMN IF EXISTS "product_id"`);
        await queryRunner.query(`ALTER TABLE "agent_profits" DROP COLUMN IF EXISTS "order_business_id"`);
        await queryRunner.query(`ALTER TABLE "agent_profits" DROP COLUMN IF EXISTS "order_count"`);
        await queryRunner.query(`ALTER TABLE "agent_profits" DROP COLUMN IF EXISTS "start_date"`);
        await queryRunner.query(`ALTER TABLE "agent_profits" DROP COLUMN IF EXISTS "end_date"`);
        
        // 修改order_id为非空
        await queryRunner.query(`ALTER TABLE "agent_profits" ALTER COLUMN "order_id" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 恢复order_id为可空
        await queryRunner.query(`ALTER TABLE "agent_profits" ALTER COLUMN "order_id" DROP NOT NULL`);
        
        // 恢复删除的字段
        await queryRunner.query(`ALTER TABLE "agent_profits" ADD COLUMN IF NOT EXISTS "product_id" integer`);
        await queryRunner.query(`ALTER TABLE "agent_profits" ADD COLUMN IF NOT EXISTS "order_business_id" integer`);
        await queryRunner.query(`ALTER TABLE "agent_profits" ADD COLUMN IF NOT EXISTS "order_count" integer DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "agent_profits" ADD COLUMN IF NOT EXISTS "start_date" timestamp`);
        await queryRunner.query(`ALTER TABLE "agent_profits" ADD COLUMN IF NOT EXISTS "end_date" timestamp`);
    }
} 