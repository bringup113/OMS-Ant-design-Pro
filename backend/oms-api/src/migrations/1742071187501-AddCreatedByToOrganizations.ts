import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToOrganizations1742071187501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN "created_by" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "created_by"`,
    );
  }
} 