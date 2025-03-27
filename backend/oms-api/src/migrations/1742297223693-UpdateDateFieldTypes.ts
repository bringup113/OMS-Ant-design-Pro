import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDateFieldTypes1742297223693 implements MigrationInterface {
    name = 'UpdateDateFieldTypes1742297223693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE customers ALTER COLUMN "birthDate" TYPE varchar(10)`);
        await queryRunner.query(`ALTER TABLE customers ALTER COLUMN "issueDate" TYPE varchar(10)`);
        await queryRunner.query(`ALTER TABLE customers ALTER COLUMN "expiryDate" TYPE varchar(10)`);
        await queryRunner.query(`ALTER TABLE visas ALTER COLUMN "issueDate" TYPE varchar(10)`);
        await queryRunner.query(`ALTER TABLE visas ALTER COLUMN "expiryDate" TYPE varchar(10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE visas ALTER COLUMN "expiryDate" TYPE bigint USING "expiryDate"::bigint`);
        await queryRunner.query(`ALTER TABLE visas ALTER COLUMN "issueDate" TYPE bigint USING "issueDate"::bigint`);
        await queryRunner.query(`ALTER TABLE customers ALTER COLUMN "expiryDate" TYPE bigint USING "expiryDate"::bigint`);
        await queryRunner.query(`ALTER TABLE customers ALTER COLUMN "issueDate" TYPE bigint USING "issueDate"::bigint`);
        await queryRunner.query(`ALTER TABLE customers ALTER COLUMN "birthDate" TYPE bigint USING "birthDate"::bigint`);
    }
}
