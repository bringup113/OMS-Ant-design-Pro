import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCategoriesTable1742046000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "parentId" integer,
        "sort" integer NOT NULL DEFAULT 0,
        "status" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_categories_code" UNIQUE ("code"),
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "product_categories" ADD CONSTRAINT "FK_product_categories_parent"
      FOREIGN KEY ("parentId") REFERENCES "product_categories"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_categories" DROP CONSTRAINT "FK_product_categories_parent"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
  }
} 