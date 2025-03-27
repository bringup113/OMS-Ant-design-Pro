import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1710597600000 implements MigrationInterface {
    name = 'CreateProductsTable1710597600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建产品表
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL,
                "category_id" INTEGER NOT NULL,
                "description" TEXT,
                "status" VARCHAR(50) NOT NULL DEFAULT 'offline',
                "sort" INTEGER DEFAULT 100,
                "cost_price" DECIMAL(10,2) NOT NULL,
                "selling_price" DECIMAL(10,2) NOT NULL,
                "currency" VARCHAR(10) NOT NULL DEFAULT 'CNY',
                "supplier_id" INTEGER,
                "created_by" INTEGER NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_products_category" FOREIGN KEY ("category_id") 
                    REFERENCES "product_categories" ("id") ON DELETE RESTRICT,
                CONSTRAINT "fk_products_supplier" FOREIGN KEY ("supplier_id") 
                    REFERENCES "organizations" ("id") ON DELETE SET NULL,
                CONSTRAINT "fk_products_creator" FOREIGN KEY ("created_by") 
                    REFERENCES "users" ("id") ON DELETE RESTRICT
            )
        `);

        // 创建索引
        await queryRunner.query(`
            CREATE INDEX "idx_products_category_id" ON "products" ("category_id");
            CREATE INDEX "idx_products_supplier_id" ON "products" ("supplier_id");
            CREATE INDEX "idx_products_created_by" ON "products" ("created_by");
            CREATE INDEX "idx_products_status" ON "products" ("status");
        `);

        // 创建更新时间触发器
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_products_updated_at
                BEFORE UPDATE ON products
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除触发器
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_products_updated_at ON products;
            DROP FUNCTION IF EXISTS update_updated_at_column;
        `);

        // 删除索引
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_products_category_id;
            DROP INDEX IF EXISTS idx_products_supplier_id;
            DROP INDEX IF EXISTS idx_products_created_by;
            DROP INDEX IF EXISTS idx_products_status;
        `);

        // 删除表
        await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    }
} 