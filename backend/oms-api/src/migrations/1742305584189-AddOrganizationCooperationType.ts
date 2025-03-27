import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationCooperationType1742305584189 implements MigrationInterface {
    name = 'AddOrganizationCooperationType1742305584189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加合作方式字段
        await queryRunner.query(`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "cooperation_type" character varying(20)`);
        
        // 设置默认值
        await queryRunner.query(`UPDATE "organizations" SET "cooperation_type" = 'normal_trade' WHERE "cooperation_type" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "cooperation_type"`);
    }
} 