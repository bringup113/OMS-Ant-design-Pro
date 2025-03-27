import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAgentCooperationType1742994181694 implements MigrationInterface {
    name = 'UpdateAgentCooperationType1742994181694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "cooperationType" SET DEFAULT 'none'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agents" ALTER COLUMN "cooperationType" DROP DEFAULT`);
    }
} 