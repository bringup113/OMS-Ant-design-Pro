import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfitTables1711545999000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查表是否存在
    const tablesExist = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_profits'
      )
    `);
    
    if (tablesExist[0].exists) {
      console.log('Profit tables already exist, skipping creation...');
      return;
    }
    
    // 创建代理商利润表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_profits" (
        "id" SERIAL PRIMARY KEY,
        "agent_id" INTEGER NOT NULL,
        "product_id" INTEGER NOT NULL,
        "agent_price" DECIMAL(10, 2) NOT NULL,
        "sale_price" DECIMAL(10, 2) NOT NULL,
        "profit" DECIMAL(10, 2) NOT NULL,
        "profit_rate" DECIMAL(5, 2) NOT NULL,
        "commission_rate" DECIMAL(5, 2) NOT NULL,
        "commission" DECIMAL(10, 2) NOT NULL,
        "order_count" INTEGER NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "settlement_status" VARCHAR DEFAULT 'unsettled',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // 创建供应商利润表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "supplier_profits" (
        "id" SERIAL PRIMARY KEY,
        "supplier_id" INTEGER NOT NULL,
        "product_id" INTEGER NOT NULL,
        "purchase_price" DECIMAL(10, 2) NOT NULL,
        "sale_price" DECIMAL(10, 2) NOT NULL,
        "profit" DECIMAL(10, 2) NOT NULL,
        "profit_rate" DECIMAL(5, 2) NOT NULL,
        "order_count" INTEGER NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "settlement_status" VARCHAR DEFAULT 'unsettled',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "supplier_profits"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_profits"`);
  }
} 