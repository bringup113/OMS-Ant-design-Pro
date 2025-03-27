import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillPaymentRecordsTable1742360000000 implements MigrationInterface {
  name = 'AddBillPaymentRecordsTable1742360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 更新账单状态枚举类型
    await queryRunner.query(`
      ALTER TABLE "bills" 
      DROP CONSTRAINT IF EXISTS "bills_status_check"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "bills"
      ALTER COLUMN "status" TYPE varchar(20)
    `);
    
    await queryRunner.query(`
      ALTER TABLE "bills"
      ADD CONSTRAINT "bills_status_check" 
      CHECK (status IN ('paid', 'partially_paid', 'unpaid'))
    `);
    
    // 创建付款记录表
    await queryRunner.query(`
      CREATE TABLE "bill_payment_records" (
        "id" SERIAL PRIMARY KEY,
        "bill_id" integer NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "remark" text NULL,
        "payment_method" varchar(50) NOT NULL DEFAULT 'cash',
        "payment_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "created_by" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "FK_bill_payment_records_bill_id" 
        FOREIGN KEY ("bill_id") 
        REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除付款记录表
    await queryRunner.query(`
      DROP TABLE "bill_payment_records"
    `);
    
    // 恢复账单状态枚举类型
    await queryRunner.query(`
      ALTER TABLE "bills" 
      DROP CONSTRAINT IF EXISTS "bills_status_check"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "bills"
      ALTER COLUMN "status" TYPE varchar(10)
    `);
    
    await queryRunner.query(`
      ALTER TABLE "bills"
      ADD CONSTRAINT "bills_status_check" 
      CHECK (status IN ('paid', 'unpaid'))
    `);
  }
} 