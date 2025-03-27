import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBillsTable1742350000000 implements MigrationInterface {
  name = 'CreateBillsTable1742350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建bills表
    await queryRunner.query(`
      CREATE TABLE "bills" (
        "id" SERIAL PRIMARY KEY,
        "template_id" integer NOT NULL,
        "total_amount" decimal(10,2) NOT NULL,
        "status" varchar(10) NOT NULL DEFAULT 'unpaid',
        "remark" text NULL,
        "agent_id" integer NULL,
        "created_by" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    // 修改orders表，添加bill_id字段并更新account_status类型
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD COLUMN "bill_id" integer NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" 
      ALTER COLUMN "account_status" TYPE varchar(20),
      ALTER COLUMN "account_status" SET DEFAULT 'unbilled'
    `);

    // 添加外键约束
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD CONSTRAINT "FK_orders_bill_id" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键约束
    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_bill_id"
    `);

    // 恢复orders表
    await queryRunner.query(`
      ALTER TABLE "orders" 
      DROP COLUMN "bill_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" 
      ALTER COLUMN "account_status" TYPE varchar(20),
      ALTER COLUMN "account_status" SET DEFAULT 'unrecorded'
    `);

    // 删除bills表
    await queryRunner.query(`DROP TABLE "bills"`);
  }
} 