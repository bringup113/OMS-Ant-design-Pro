import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerTables1710720000000 implements MigrationInterface {
  name = 'CreateCustomerTables1710720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建客户表
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "passportNo" character varying(50) NOT NULL,
        "gender" character varying(10) NOT NULL,
        "country" character varying(50) NOT NULL,
        "birthDate" bigint NULL,
        "issueDate" bigint NULL,
        "expiryDate" bigint NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e6c15fb94823d2cc81e520d7b71" UNIQUE ("passportNo"),
        CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id")
      )
    `);

    // 创建签证表
    await queryRunner.query(`
      CREATE TABLE "visas" (
        "id" SERIAL NOT NULL,
        "customerId" integer NOT NULL,
        "country" character varying(50) NOT NULL,
        "visaType" character varying(50) NOT NULL,
        "visaName" character varying(100) NOT NULL,
        "issueDate" bigint NULL,
        "expiryDate" bigint NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ef97e93b657ad9da6434135df38" PRIMARY KEY ("id")
      )
    `);

    // 添加外键约束
    await queryRunner.query(`
      ALTER TABLE "visas" ADD CONSTRAINT "FK_c77a4135320293a7e557f4afc8c"
      FOREIGN KEY ("customerId") REFERENCES "customers"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键约束
    await queryRunner.query(`ALTER TABLE "visas" DROP CONSTRAINT "FK_c77a4135320293a7e557f4afc8c"`);
    
    // 删除表
    await queryRunner.query(`DROP TABLE "visas"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
} 