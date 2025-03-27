import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentsTable1742298711269 implements MigrationInterface {
    name = 'CreateAgentsTable1742298711269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "agents" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "contact" character varying(20) NOT NULL, "status" character varying(10) NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c653f28ae19c5884d5baf6a1d9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "agents"`);
    }
}
