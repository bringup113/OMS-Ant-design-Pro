import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgentCooperationFields1742305584189 implements MigrationInterface {
    name = 'AddAgentCooperationFields1742305584189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agents" ADD "cooperationType" character varying(20) NOT NULL DEFAULT 'regular'`);
        await queryRunner.query(`ALTER TABLE "agents" ADD "commissionRate" numeric(5,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "commissionRate"`);
        await queryRunner.query(`ALTER TABLE "agents" DROP COLUMN "cooperationType"`);
    }
}
